;(function(document, fetcher, handler)
{
	var settings =
	{
		endpoint: "https://handler.metascript.io/"
	};

	// Retrieve the current <script> tag (which is the last <script> tag in the current DOM).
	var script_tags = document.getElementsByTagName('script'),
	    this_tag = script_tags[script_tags.length - 1];

	// Get the content between the start and end tag. This is our manifest file.
	var manifest = this_tag.innerHTML;

	// Try to parse it as JSON. If this fails, the content isn't valid JSON, and we give up.
	try
	{
		manifest = JSON.parse(manifest);
	}catch(exception)
	{
		console.warn('Manifest content couldn\'t be parsed as JSON:', exception);
	}

	// If the endpoint is set in the manifest, use it instead of the default.
	settings.endpoint = manifest.endpoint || settings.endpoint;


	// Request the dependencies from the back-end.
	fetcher(settings.endpoint, manifest.require, function(result)
	{
		// Result should be JSON-parsable. If not, something went wrong, and we give up.
		try
		{
			result = JSON.parse(result);
		}catch(exception)
		{
			console.warn('MetaScript back-end result couldn\'t be parsed as JSON:', exception);
		}

		// Parse each file and handle output.
		for(var i = 0; i < result.files.length; i++)
		{
			handler(result.files[i]);
		}
	});

})(document, __metascript_fetcher, __metascript_handler);



function __metascript_fetcher(endpoint, data, callback)
{
	var xhr = new XMLHttpRequest();

	xhr.open('GET', endpoint + '?data=' + JSON.stringify(data), true);

	xhr.addEventListener('readystatechange', function()
	{
		if(xhr.readyState === 4)
		{
			callback(xhr.responseText);
		}
	}, false);

	xhr.send();
}



function __metascript_handler(entry)
{
	var element = document.createElement(entry.type);

	for(var prop in entry.props)
	{
		element.setAttribute(prop, entry.props[prop]);
	}

	document[entry.location].appendChild(element);
}
