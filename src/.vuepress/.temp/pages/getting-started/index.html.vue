<template><div><h2 id="how-do-i-use-it" tabindex="-1"><a class="header-anchor" href="#how-do-i-use-it" aria-hidden="true">#</a> How do I use it?</h2>
<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/getting-started-video.mov">
  Your browser does not support the video tag.
</video>
<ol>
<li>
<p>Download the plugin installer. Run it.</p>
</li>
<li>
<p>Open <a href="Ableton">https://www.ableton.com/</a>.  Find the plugin in Ableton's plugin menu: <code v-pre>Plugin-Ins -&gt; SignalsAndSorcery -&gt; DAWNet.vst3</code>.  (If you don't see the plugin go to <code v-pre>options -&gt; preferences -&gt; &quot;Use VST3 plugin system folder&quot; -&gt; rescan</code>)
<img src="https://storage.googleapis.com/docs-assets/gettingstarted2.png" alt="Step 1&amp;2"></p>
</li>
<li>
<p>Open the plugin.  The home view of the plugin lists remade Google Colabs.  Click on a Colab to open it.</p>
</li>
<li>
<p>From the plugin copy the &quot;token&quot; from top right of DAWNet VST interface.
<img src="https://storage.googleapis.com/docs-assets/gettingsstarted4.png" alt="Step 3&amp;4"></p>
</li>
<li>
<p>Paste the &quot;token&quot; into Colab.  Find the token variable (called something similar to <code v-pre>dawnet_token</code>).  Set the value.
<img src="https://storage.googleapis.com/docs-assets/gettingstarted5.png" alt="Step 5"></p>
</li>
<li>
<p>At this point the Plugin and the Colab server should have <code v-pre>found</code> each other via the underlying web-socket server.</p>
</li>
<li>
<p>If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio &amp; MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will handle transferring files and other input params over the network to the remote compute.<br>
<img src="https://storage.googleapis.com/docs-assets/gettingstarted7.png" alt="Step 7"></p>
</li>
</ol>
<h2 id="workflow-example" tabindex="-1"><a class="header-anchor" href="#workflow-example" aria-hidden="true">#</a> Workflow example</h2>
<p>In this video I demonstrate how to use the DAWNet plugin to perform <code v-pre>audio style transfer</code> powered by Meta's <a href="https://ai.meta.com/resources/models-and-libraries/audiocraft/" target="_blank" rel="noopener noreferrer">MusicGen<ExternalLinkIcon/></a> project.</p>
<video width="100%" controls>
  <source src="https://storage.googleapis.com/docs-assets/style-tranfer-demo.mov">
  Your browser does not support the video tag.
</video></div></template>


