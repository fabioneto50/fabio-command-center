(()=>{
  if(window.fccDilutionsHBAData)return;
  window.fccDilutionsHBAData=(async()=>{
    if(typeof DecompressionStream==='undefined')throw new Error('Este browser não suporta a descompressão da base documental.');
    const b64=(window.__fccHBAChunks||[]).join('');
    if(!b64)throw new Error('Base documental incompleta');
    const bin=atob(b64),bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const data=JSON.parse(await new Response(stream).text());
    window.__fccHBAChunks=null;
    return data;
  })();
})();
