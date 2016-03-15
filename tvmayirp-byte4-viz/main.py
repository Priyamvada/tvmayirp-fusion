#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import os
import webapp2
import jinja2
import logging
import json
import urllib

from googleapiclient.discovery import build

from flask import Flask

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

app = Flask(__name__)

API_KEY = 'AIzaSyCiKuZEp9SuK63ddkEdO4YcfASwrVEpFzo'
service = build('fusiontables', 'v1', developerKey=API_KEY)
TABLE_ID = '1udSBys5IgI47_Oaz3MfqZnWwwHVKaul9ItgXi3gB'

def get_all_data(query):
    try:
        fp = open("data/data.json")
        response = simplejson.load(fp)
        # but if that file does not exist, download the data from fusiontables
    except IOError:
        response = service.query().sql(sql=query).execute()
        logging.info(response['columns'])
        logging.info(response['rows'])
    return response

def make_query(cols):
    string_cols = ""
    if cols == []:
        cols = ['*']
        query = "SELECT * FROM " + TABLE_ID
    else:
        for col in cols:
            string_cols = string_cols + ", " + col
        
        string_cols = string_cols[2:len(string_cols)]
        query = "SELECT " + string_cols + " FROM " + TABLE_ID
    
    
    logging.info("The query to be made: ")
    logging.info(query)
    
    return query

@app.route('/')
def index():
    cols = []
    # response = get_all_data(make_query(cols))
    data = [['Age', 'Adopted', 'Euthanized'],['< 6 months',  1000,      400],['6-12 months',  1170,      460],['12-5 years',  660,       1120],['>5 years',  1030,      540]]
    template = JINJA_ENVIRONMENT.get_template('templates/index.html')
    return template.render({'data':data})

@app.route('/about')
def about():
    template = JINJA_ENVIRONMENT.get_template('templates/about.html')
    return template.render()

@app.route('/quality')
def quality():
    template = JINJA_ENVIRONMENT.get_template('templates/quality.html')
    return template.render()

@app.route('/references')
def references():
    template = JINJA_ENVIRONMENT.get_template('templates/blackboardResponses.html')
    return template.render()

# app = webapp2.WSGIApplication([
# 	('/', MainHandler)
# ], debug=True)
