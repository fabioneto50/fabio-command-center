(()=>{
  if(window.fccCufClinicalDocs)return;
  const unpack=async(b64,label)=>{
    if(typeof DecompressionStream==='undefined')throw new Error('Browser sem suporte de descompressão para '+label);
    const bin=atob(b64||'');if(!bin)throw new Error('Dados em falta: '+label);
    const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  };
  window.fccCufClinicalDocs=Promise.all([
    unpack(window.__fccInf2213B64,'INF.2213.00'),
    unpack((window.__fccInf1030Chunks||[]).join(''),'INF.1030.11')
  ]).then(([antibiotics,stability])=>{
    window.__fccInf2213B64=null;window.__fccInf1030Chunks=null;
    return {antibiotics,stability};
  });
})();
