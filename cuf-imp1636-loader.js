(()=>{
  if(window.fccIMP1636Data)return;
  window.fccIMP1636Data=(async()=>{
    if(typeof DecompressionStream==='undefined')throw new Error('Este browser não suporta a descompressão da base IMP.1636.');
    const b64=(window.__fccIMP1636Chunks||[]).join('');
    if(!b64)throw new Error('Base IMP.1636 incompleta');
    const bin=atob(b64),bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const data=JSON.parse(await new Response(stream).text());
    window.__fccIMP1636Chunks=null;
    return data;
  })();
})();
