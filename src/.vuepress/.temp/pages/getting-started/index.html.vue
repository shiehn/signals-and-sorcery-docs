<template><div><h1 id="what-is-dawnet" tabindex="-1"><a class="header-anchor" href="#what-is-dawnet" aria-hidden="true">#</a> What is DAWNet?</h1>
<p>DAWNet is a way to execute Python code hosted in the cloud.  It's a plugin, a server, and a pip package. &amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp;&amp; It    The code is standard, arbitrary Python3 functions.  The <RouterLink to="/client/">dawnet-client</RouterLink> is used to register, call functions, and send data back and forth from the DAW to the remote compute.</p>
<h2 id="how-does-it-work" tabindex="-1"><a class="header-anchor" href="#how-does-it-work" aria-hidden="true">#</a> How does it work?</h2>
<p>DAWNet is a P2P system (kinda?) made of three core components. 1. A network discovery server.  Essentially a system that brokers data transfer between the DAWNet VST and the remote compute.  2) A Python3 pip package dawnet-client. The package is responsible for registering a function for remote execution.  3)  A native DAW plugin.  The plugin is essentially a web-form.  An interface generated from the remote function's signature.  The plugin allows the user to drag/drop audio/midi files from the DAW into plugin, which is then transferred to the remote compute instance</p>
<h2 id="how-do-i-try-it" tabindex="-1"><a class="header-anchor" href="#how-do-i-try-it" aria-hidden="true">#</a> How do I try it?</h2>
<ol>
<li>Download the plugin. Install it.</li>
<li>Choose a community <code v-pre>remote</code>, AKA a Google Colab notebook. Load it in colab.</li>
<li>Generate &amp; Copy a &quot;token&quot; from the DAWNet VST interface (top bar).</li>
<li>Paste the &quot;token&quot; into Colab.  Find the token variable (called something similar to <code v-pre>dawnet_token</code>).  Set the value.</li>
<li>At this point the Plugin and the Colab server should have <code v-pre>found</code> each other via the underlying web-socket server.</li>
<li>If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio &amp; MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will handle transferring files and other input params over the network to the remote compute.</li>
</ol>
<p><img src="/mush_one.png" alt="Mushroom"></p>
<p><a href="https://storage.googleapis.com/docs-assets/dawnet-logo.png" target="_blank" rel="noopener noreferrer">Link Text<ExternalLinkIcon/></a></p>
</div></template>


