"use client";
const PLANS = [
  { name:"Free", price:"$0", features:["50 messages/day","All AI verticals","Basic builder","Community support"], cta:"Current Plan", color:"#555", bg:"#111116" },
  { name:"Starter", price:"$27", features:["Unlimited messages","Priority SAL Pro","Social Studio","Email support"], cta:"Start Free Trial", color:"#F59E0B", bg:"#111116" },
  { name:"Pro", price:"$97", features:["Everything in Starter","SAL Max model","Voice AI","Career Suite","API access"], cta:"Go Pro", color:"#22C55E", bg:"#0A110D", badge:"POPULAR" },
  { name:"Teams", price:"$297", features:["5 seats","Team workspace","Builder deploy","Priority support"], cta:"Start Teams", color:"#818CF8", bg:"#0A0A12" },
  { name:"Enterprise", price:"$497", features:["Unlimited seats","Custom fine-tune","Dedicated CSM","White label","SLA uptime"], cta:"Contact Sales", color:"#EC4899", bg:"#12090F" },
];
export default function PricingPage() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
      <div className="mb-4">
        <h1 className="text-[19px] font-extrabold text-gold mb-1">Pricing</h1>
        <p className="text-[12.5px] text-[#555]">Responsible Intelligence™ for every team size and budget.</p>
      </div>
      <div className="space-y-2.5">
        {PLANS.map(p=>(
          <div key={p.name} className="rounded-xl p-3.5 border relative hover:-translate-y-0.5 hover:shadow-lg transition-all"
            style={{background:p.bg, borderColor:p.color+"28"}}>
            {"badge" in p && p.badge && (
              <div className="absolute top-2.5 right-2.5 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded tracking-widest text-black" style={{background:p.color}}>{p.badge}</div>
            )}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[20px] font-black" style={{color:p.color}}>{p.price}</span>
              <span className="text-[11px] text-[#555]">/mo</span>
              <span className="text-[13px] font-bold text-[#E8E6E1] ml-1.5">{p.name}</span>
            </div>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {p.features.map(f=>(
                <span key={f} className="text-[11.5px] text-[#777] flex items-center gap-1">
                  <span className="text-[8px]" style={{color:p.color}}>●</span>{f}
                </span>
              ))}
            </div>
            <button className="px-4 py-1.5 rounded-lg text-[12px] font-bold border transition-all hover:brightness-110"
              style={{borderColor:p.color, color:p.color, background:"transparent"}}>{p.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
