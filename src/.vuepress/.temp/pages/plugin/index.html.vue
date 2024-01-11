<template><div><h1 id="vst3-plugin" tabindex="-1"><a class="header-anchor" href="#vst3-plugin" aria-hidden="true">#</a> VST3 Plugin</h1>
<h2 id="installation" tabindex="-1"><a class="header-anchor" href="#installation" aria-hidden="true">#</a> Installation</h2>
<p><a href="https://storage.googleapis.com/docs-assets/DAWNetInstaller_v0_1_6.zip" target="_blank" rel="noopener noreferrer">Download<ExternalLinkIcon/></a> the zip package installer.  Run it.  By default, the <code v-pre>.vst3</code> file should end up at this location: <code v-pre>/Library/Audio/Plug-Ins/VST3</code>.  Note: some people prefer plugins in their user directory: <code v-pre> ~/Library/Audio/Plug-Ins/VST3</code>.  Move it if you wish.</p>
<div class="custom-container warning"><p class="custom-container-title">WARNING</p>
<p>NOTE: The plugin is in an active development, pre-alpha state.  It has only been tested on Ableton 11 on MAC M1.</p>
</div>
<h2 id="usage" tabindex="-1"><a class="header-anchor" href="#usage" aria-hidden="true">#</a> Usage</h2>
<ul>
<li>Once the plugin becomes available in the DAW, add it to a track.</li>
<li>Next, you will need to connect it to a remote compute instance.  The easy way to get started is to use a pre-made <RouterLink to="/remotes/">DAWNet remote</RouterLink> and host it in Google CoLab.</li>
<li>We can now connect the plugin to the <code v-pre>DAWNet Remote</code>.  To do this open the plugin and generate/copy a token from the top bar in the GUI.</li>
<li>Paste this token in the <code v-pre>DAWNet Remote</code> and run it.</li>
<li>Within a few seconds the plugin and remote should &quot;discover&quot; each other via the discovery server.</li>
<li>At this point you should see a representation of the remote function and are able to run it</li>
</ul>
<div class="custom-container tip"><p class="custom-container-title">TIP</p>
<p>To add an audio file to the plugin from Ableton <code v-pre>opt + mouse drag</code> the file into the plugin
To add an output file from the plugin to Ableton <code v-pre>opt + mouse drag</code> the icon found in the results view, on the right of the file name.</p>
</div>
</div></template>


