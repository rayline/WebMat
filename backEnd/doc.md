#WebMat BackEnd

This is the back end server of WebMat, a simple online web service for light matrix computing.

##Functions

+ Serve the web pages
+ Do matrix multiplication, determinant and inverse matrix with <code>numpy</code>

##Dependencies

+ Django
+ Numpy

##API

+ /api/calc POST  
JSON object should be posted  

		{
			"operation": "multi",
			"args" : [
				[[1,2],[3,4]],
				[[5,6],[7,8]]
			]
		}

		{
			"operation": "det",
			"args" : [
				[[1,2],[3,4]]
			]
		}

		{
			"operation": "inv",
			"args" : [
				[[1,2],[3,4]]
			]
		}

##Installation

We recommand you to use it with Apache Web Server, but almost all other web servers like nginx or tomcat will work.  
Here are steps you should follow to install the back end server. 

1. Install a web server
2. Install a plugin or extension or anything else to provide WSGI support
3. Configure you site
4. Put static front-end files into the right directory, usually /var/www/html
5. Put the back end scripts under the directory you want, not the same directory as static files
6. Point to wsgi.py in your site configure file and redirect the alias of wsgi.py to /api
7. Install pip, and then use pip to install Numpy and Django
8. Run!