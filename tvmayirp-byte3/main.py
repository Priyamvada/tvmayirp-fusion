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
import jinja2
import webapp2
import logging
import json
import urllib
import MySQLdb
import math

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

# Define your production Cloud SQL instance information.
_INSTANCE_NAME = 'tvmayirp-fusion-mobile-byte3:tvmayirp-byte3-mobiledata'
_DB_NAME = 'tvmayirp_mobiledata'
_USER = 'tvmayirp' # or whatever other user account you created


# the table where activities are logged
_ACTIVITY = 'plugin_google_activity_recognition'
# the table where locations are logged
_LOCATIONS = 'locations'
# the distance that determins new locations
_EPSILON = 1

DEVICE_ID = 'dd60e311-dfb7-4aef-b93d-bfceafa933d4ll'

if (os.getenv('SERVER_SOFTWARE') and
    os.getenv('SERVER_SOFTWARE').startswith('Google App Engine/')):
    _DB = MySQLdb.connect(unix_socket='/cloudsql/' + _INSTANCE_NAME,
                          db=_DB_NAME,
                          user=_USER,
                          charset='utf8')
else:
    _DB = MySQLdb.connect(host='173.194.255.111',
                          port=3306,
                          db=_DB_NAME,
                          user=_USER,
                          charset='utf8')

    # Alternatively, connect to a Google Cloud SQL instance using:
    # _DB = MySQLdb.connect(host='ip-address-of-google-cloud-sql-instance', port=3306, user=_USER, charset='utf8')

# Import the Flask Framework
from flask import Flask, request
app = Flask(__name__)

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

@app.route('/')
def index():
    template = JINJA_ENVIRONMENT.get_template('templates/index.html')

    cursor = _DB.cursor()
    cursor.execute('SHOW TABLES')
    
    logging.info(cursor.fetchall())
    db.close()

    return template.render()
    
@app.route('/about')
def about():
    template = JINJA_ENVIRONMENT.get_template('templates/about.html')
    return template.render()

@app.route('/quality')
def quality():
    template = JINJA_ENVIRONMENT.get_template('templates/quality.html')
    return template.render()

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL.', 404

@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500

