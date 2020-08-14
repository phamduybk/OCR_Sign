import flask 
from flask import Flask, request, render_template, jsonify
from util import base64_to_pil, np_to_base64
import uuid
import easyocr
import numpy as np
import os
import json

from PIL import Image, ImageDraw, ImageFont


def draw_boxes(image, bounds, color='blue', width=2):
    draw = ImageDraw.Draw(image)
    for bound in bounds:
        p0, p1, p2, p3 = bound[0]
        #text = bound[1]
        #draw.text([*p0], text,fill ="red", font = font, align ="left")  
        draw.line([*p0, *p1, *p2, *p3, *p0], fill=color, width=width)
    
    image = np.array(image)
    image_base64 = np_to_base64(image)
    return image_base64
    
def convert_to_json(src, bounds):
    size_of_bounds = len(bounds)
    dict_json = {'src':src, 'len':size_of_bounds}
    data = []
    for bound in bounds:
        tmp = {}
        toado = bound[0]
        # x1,y1 = toado[0]
        # x2,y2 = toado[1]
        # x3,y3 = toado[2]
        # x4,y4 = toado[3]
        tmp_point = {}
        for i, value in enumerate(toado):
            tmp_point['point'+str(i)] = {'x': int(value[0]),'y': int(value[1])}

        text = bound[1]
        confident = bound[2]
        tmp['text'] = text
        tmp['conf'] = confident
        tmp['point'] = tmp_point
        data.append(tmp)
    dict_json['bounds']=data 
    jsonobj = json.dumps(dict_json)
    return jsonobj


app = Flask(__name__)

@app.route("/")
@app.route("/index")
def index():
    return render_template('index.html')


@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
         # Get the image from post request
        img = base64_to_pil(request.json)
        np_img = np.array(img)
        
        # # Save the image to ./uploads
        # img.save("./uploads/" + id_image +".png")

        bounds = reader.readtext(np_img)
        
        img_base64 = draw_boxes(img, bounds)

        jsonobj = convert_to_json(img_base64,bounds)
        return jsonobj
    return None



if __name__ == "__main__":
    reader = easyocr.Reader(['vi','vi'], gpu = False)
    app.run(host='0.0.0.0', port=8000, debug = True)


