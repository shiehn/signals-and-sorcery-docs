<template><div><h1 id="dawnet-remotes" tabindex="-1"><a class="header-anchor" href="#dawnet-remotes" aria-hidden="true">#</a> DAWNet Remotes</h1>
<h2 id="what-are-they" tabindex="-1"><a class="header-anchor" href="#what-are-they" aria-hidden="true">#</a> What are they?</h2>
<p>DAWNet remotes are python scripts that are registered with the DAWNet discovery server.  They are triggered remotely by the DAWNet plugin.  They can be run locally, on a remote server, or in Google Colabs.  They can be used to execute arbitrary code, or to wrap existing projects.</p>
<h2 id="how-do-i-use-them" tabindex="-1"><a class="header-anchor" href="#how-do-i-use-them" aria-hidden="true">#</a> How do I use them?</h2>
<ol>
<li>Install the <RouterLink to="/getting-started/#installation">DAWNet plugin</RouterLink>.</li>
<li>Generate &amp; Copy a &quot;token&quot; from the DAWNet VST interface (top bar).</li>
<li>Choose a colab below and follow the link.</li>
<li>Open the colab in Google Colab by clicking the &quot;Open in Colab&quot; button.</li>
<li>Paste the &quot;token&quot; into Colab.  Find the token variable (called something similar to <code v-pre>dawnet_token</code>).  Set the value.</li>
<li>At this point the Plugin and the Colab server should have <code v-pre>found</code> each other via the underlying web-socket server.</li>
<li>Fill in values &amp; files in the colab form.  Click &quot;Run&quot; in the colab form.</li>
</ol>
<h2 id="google-colabs" tabindex="-1"><a class="header-anchor" href="#google-colabs" aria-hidden="true">#</a> Google Colabs</h2>
<blockquote>
<p>Name: <strong>Demucs Stemify</strong><br/>
Description: A wrapper for the OS Demucs Stemifier.  Send an audio file and get stems back.<br/>
Link: <a href="https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_Demucs.ipynb" target="_blank" rel="noopener noreferrer">DAWNet Demucs<ExternalLinkIcon/></a></p>
</blockquote>
<blockquote>
<p>Name: <strong>Text-To-Audio MusicGen</strong><br/>
Description: A wrapper for Meta's MusicGen project.  Send a text description and get back audio.<br/>
Link: <a href="https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_MusicGen.ipynb" target="_blank" rel="noopener noreferrer">Text-To-Audio<ExternalLinkIcon/></a></p>
</blockquote>
<blockquote>
<p>Name: <strong>Style Transfer MusicGen</strong><br/>
Description: Send an audio file with a text description and get back a file with the description applied.<br/>
Link: <a href="https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_Style_Transfer_MusicGen.ipynb" target="_blank" rel="noopener noreferrer">Style Transfer<ExternalLinkIcon/></a></p>
</blockquote>
<blockquote>
<p>Name: <strong>MusicLM</strong><br/>
Description: A wrapper for Googles MusicLM project<br/>
Link: (TODO)</p>
</blockquote>
<h2 id="virtual-machine-gpu-todo" tabindex="-1"><a class="header-anchor" href="#virtual-machine-gpu-todo" aria-hidden="true">#</a> Virtual Machine / GPU (TODO)</h2>
<p>(TODO) explain setting up a gpu somewhere ...</p>
<h2 id="local-gpu-todo" tabindex="-1"><a class="header-anchor" href="#local-gpu-todo" aria-hidden="true">#</a> Local GPU (TODO)</h2>
<p>(TODO) explain local gpu ...</p>
<h2 id="how-do-i-make-my-own" tabindex="-1"><a class="header-anchor" href="#how-do-i-make-my-own" aria-hidden="true">#</a> How do I make my own?</h2>
<p>Creating your own remote is easy.  Just copy and modify the <a href="https://github.com/shiehn/dawnet-remotes/blob/main/DAWNet_Remote_template.ipynb" target="_blank" rel="noopener noreferrer">DAWNet Remote Template<ExternalLinkIcon/></a>.  You  will see a  commented section indicating where to write your custom code.  You can write any Python3 code you wish.</p>
<div class="custom-container danger"><p class="custom-container-title">DANGER</p>
<p>NOTE: The system does not guarantee any security.  Do not expose sensitive data in your remotes.</p>
</div>
</div></template>


