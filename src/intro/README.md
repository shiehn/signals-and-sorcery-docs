## What is DAWNet?

DAWNet is a VST plugin that executes remote python functions.  As an example, a user may want to perform `audio stem splitting` on a remote server.  Using the [DAWNet Client](/client/) they can send data from the DAW to the remote function, and back again. 

<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/dawnet-intro.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Who is this for?

The target user for DAWNet is a technical musician/software developer.  Google Colabs are a popular choice when experimenting with self-hosting machine learning models.  However, there is a disconnect between traditional DAWs and remote machine leaning.  DAWNet aims to be a solution for this by developing a native integration with popular DAWs.    

## How does it work?

DAWNet is a P2P system (kinda?) made of three core components. 
- A network discovery server.  Essentially a system that brokers data transfer between the DAWNet VST and the remote compute.
- A Python3 pip package dawnet-client. The package is responsible for registering a function for remote execution.  
- A native DAW plugin.  The plugin is essentially a web-form.  An interface generated from the remote function's signature.  The plugin allows the user to drag/drop audio/midi files from the DAW into plugin, which is then transferred to the remote compute instance  
