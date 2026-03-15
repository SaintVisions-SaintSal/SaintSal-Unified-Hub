"use client";
const APIS = [
  {cat:"AI Models",color:"#818CF8",items:["Claude (Anthropic)","GPT-5 Core (Azure)","GPT-5 Fast (Azure)","Grok-3 (Azure)","Gemini 2.0","Perplexity"]},
  {cat:"Voice & Speech",color:"#F59E0B",items:["ElevenLabs","Deepgram STT","AssemblyAI","Azure Speech STT/TTS"]},
  {cat:"CRM & Comms",color:"#22C55E",items:["GoHighLevel","Twilio","Resend","SendGrid"]},
  {cat:"Data & Search",color:"#EC4899",items:["Exa Search","Tavily","Apollo","PropertyRadar","RentCast","Google Maps"]},
  {cat:"Infrastructure",color:"#818CF8",items:["Supabase","MongoDB Atlas","Upstash Vector","Cloudflare","Vercel"]},
  {cat:"Finance & Commerce",color:"#22C55E",items:["Alpaca Markets","Stripe","GoDaddy","CorpNet"]},
];
export default function IntegrationsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-10">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-accent-green mb-1">Integrations</h1>
        <p className="text-[12.5px] text-[#555]">88 API connectors · 53 AI models · All systems live</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {APIS.map(cat=>(
          <div key={cat.cat} className="bg-[#111116] rounded-xl p-3 border" style={{borderColor:cat.color+"18"}}>
            <p className="text-[9px] font-extrabold tracking-widest uppercase mb-2.5" style={{color:cat.color}}>{cat.cat}</p>
            {cat.items.map(item=>(
              <div key={item} className="flex items-center gap-1.5 py-1 border-b border-[#0F0F15] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0"/>
                <span className="text-[11.5px] text-[#777]">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
