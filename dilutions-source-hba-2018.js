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

    // O DILUIÇÕES.xlsx foi produzido noutra instituição. Os respetivos códigos
    // internos não podem ser apresentados, pesquisados ou reutilizados como códigos CUF.
    const legacyCodeFields=['article','code','codigo','código','product_code','internal_code','reference','ref'];
    for(const r of (data.records||[])){
      for(const k of legacyCodeFields){
        if(Object.prototype.hasOwnProperty.call(r,k))r[k]='';
      }
    }
    data.metadata={...(data.metadata||{}),institutional_codes_removed:true,code_policy:'legacy-source-no-codes'};

    window.__fccHBAChunks=null;
    return data;
  })();
})();
