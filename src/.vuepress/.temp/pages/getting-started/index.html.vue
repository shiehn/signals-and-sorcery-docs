<template><div><h2 id="how-do-i-use-it" tabindex="-1"><a class="header-anchor" href="#how-do-i-use-it" aria-hidden="true">#</a> How do I use it?</h2>
<ol>
<li>Download the plugin installer. Run it.</li>
<li>Choose a community <RouterLink to="/remotes/">remote</RouterLink>, AKA Google Colab notebook. Load it in Colab.</li>
<li>Open <a href="Ableton">https://www.ableton.com/</a>.  Find the plugin in Ableton at <code v-pre>Plugin-Ins -&gt; SignalsAndSorcery -&gt; DAWNet.vst3</code>.  (If you don't see the plugin go to <code v-pre>options -&gt; preferences -&gt; &quot;Use VST3 plugin system folder&quot; -&gt; rescan</code>)</li>
<li>Generate &amp; Copy a &quot;token&quot; from the DAWNet VST interface (top bar).</li>
<li>Paste the &quot;token&quot; into Colab.  Find the token variable (called something similar to <code v-pre>dawnet_token</code>).  Set the value.</li>
<li>At this point the Plugin and the Colab server should have <code v-pre>found</code> each other via the underlying web-socket server.</li>
<li>If a Python function was registered it will be translated into a web form/interface in the plugin.  Files, e.x Audio &amp; MIDI files can be dragged from the host DAW's timeline into the plugin.  The plugin will handle transferring files and other input params over the network to the remote compute.</li>
</ol>
</div></template>


