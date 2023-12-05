<template><div><h2 id="what-is-dawnet" tabindex="-1"><a class="header-anchor" href="#what-is-dawnet" aria-hidden="true">#</a> What is DAWNet?</h2>
<p>DAWNet is a VST plugin that executes remote python functions.  As an example, a user may want to perform <code v-pre>audio stem splitting</code> on a remote server.  Using the <RouterLink to="/client/">DAWNet Client</RouterLink> they can send data from the DAW to the remote function, and back again.</p>
<h2 id="who-is-this-for" tabindex="-1"><a class="header-anchor" href="#who-is-this-for" aria-hidden="true">#</a> Who is this for?</h2>
<p>The target user for DAWNet is a technical musician/software developer.  Google Colabs are a popular choice when experimenting with self-hosting machine learning models.  However, there is a disconnect between traditional DAWs and remote machine leaning.  DAWNet aims to be a solution for this by developing a native integration with popular DAWs.</p>
<h2 id="how-does-it-work" tabindex="-1"><a class="header-anchor" href="#how-does-it-work" aria-hidden="true">#</a> How does it work?</h2>
<p>DAWNet is a P2P system (kinda?) made of three core components.</p>
<ul>
<li>A network discovery server.  Essentially a system that brokers data transfer between the DAWNet VST and the remote compute.</li>
<li>A Python3 pip package dawnet-client. The package is responsible for registering a function for remote execution.</li>
<li>A native DAW plugin.  The plugin is essentially a web-form.  An interface generated from the remote function's signature.  The plugin allows the user to drag/drop audio/midi files from the DAW into plugin, which is then transferred to the remote compute instance</li>
</ul>
</div></template>


