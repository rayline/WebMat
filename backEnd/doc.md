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