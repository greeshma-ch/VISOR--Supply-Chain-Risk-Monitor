

import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, CheckCircle2, Building2, Check, AlertCircle } from 'lucide-react';

interface PaymentViewProps {
  onBack: () => void;
  onPaymentSuccess: (planName: string) => void;
  selectedPlan: { name: string; price: string } | null;
}

const PaymentView: React.FC<PaymentViewProps> = ({ onBack, onPaymentSuccess, selectedPlan }) => {
  const [step, setStep] = useState<'DETAILS' | 'SUCCESS'>('DETAILS');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [entity, setEntity] = useState('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Format with spaces: XXXX XXXX XXXX XXXX
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(value);
  };

  const isCardComplete = cardNumber.replace(/\s/g, '').length === 16;
  const isExpiryComplete = expiry.length === 5;
  const isCvcComplete = cvc.length === 3;
  const isFormValid = isCardComplete && isExpiryComplete && isCvcComplete && entity.length > 2;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setStep('SUCCESS');
    if (selectedPlan) {
      onPaymentSuccess(selectedPlan.name);
    }
  };

  const formattedPrice = selectedPlan?.price === 'Custom' ? 'Custom Quote' : (selectedPlan?.price || '$0.00');

  if (step === 'SUCCESS') {
    return (
      <div className="max-w-xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">Payment Authorized</h2>
          <p className="text-slate-500 font-medium mt-2">Enterprise Handshake complete. Node limits updated for {selectedPlan?.name}.</p>
        </div>
        <div className="bg-[#0a0f1c] p-6 rounded-3xl border border-white/5 text-left space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase">Transaction ID</span>
            <span className="text-white font-mono">VS-AXB-921-001</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-bold uppercase">Status</span>
            <span className="text-emerald-500 font-black uppercase tracking-widest">Confirmed</span>
          </div>
          <div className="flex justify-between text-xs border-t border-white/5 pt-4">
            <span className="text-slate-500 font-bold uppercase">Amount Paid</span>
            <span className="text-white font-black">{formattedPrice} USD</span>
          </div>
        </div>
        <button onClick={onBack} className="w-full py-4 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:bg-slate-200 transition-all">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 text-slate-400 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Secure Checkout</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-base">Initiating Enterprise Handshake (Tier: {selectedPlan?.name || 'Inquiry'})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        <form onSubmit={handleProcessPayment} className="space-y-6">
          <div className="p-6 sm:p-8 bg-[#0a0f1c] rounded-[2rem] sm:rounded-3xl border border-white/10 shadow-xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={12} /> Billing Entity
              </label>
              <input 
                required 
                type="text" 
                placeholder="Global Logistics Corp" 
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-600 text-sm" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={12} /> Payment Card
              </label>
              <div className="relative">
                <input 
                  required 
                  type="text" 
                  placeholder="XXXX XXXX XXXX XXXX" 
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-600 text-sm transition-all ${isCardComplete ? 'border-emerald-500/50 pr-12' : 'border-white/10'}`} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   {isCardComplete ? (
                     <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                       <Check size={14} className="text-white" />
                     </div>
                   ) : (
                     <div className="w-8 h-5 bg-slate-700 rounded-sm opacity-50"></div>
                   )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expiry</label>
                <input 
                  required 
                  type="text" 
                  placeholder="MM/YY" 
                  value={expiry}
                  onChange={handleExpiryChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-600 text-sm transition-all ${isExpiryComplete ? 'border-emerald-500/50' : 'border-white/10'}`} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CVC</label>
                <input 
                  required 
                  type="text" 
                  placeholder="XXX" 
                  value={cvc}
                  onChange={handleCvcChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white outline-none focus:ring-1 focus:ring-blue-600 text-sm transition-all ${isCvcComplete ? 'border-emerald-500/50' : 'border-white/10'}`} 
                />
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={!isFormValid}
            className={`w-full py-5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${
              isFormValid 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
          >
             {isFormValid ? <Lock size={16} /> : <AlertCircle size={16} />}
             {isFormValid ? `Finalize ${formattedPrice} Payment` : 'Complete Form to Pay'}
          </button>
        </form>

        <div className="space-y-6">
           <div className="p-6 sm:p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] sm:rounded-3xl space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                 <ShieldCheck className="text-blue-400" size={20} /> Security Summary
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">Your payment data is encrypted with AES-256 and processed through our sovereign financial nodes. VISOR does not store plain-text card metadata.</p>
              <div className="pt-4 flex flex-wrap gap-3">
                 <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5">PCI-DSS Level 1</div>
                 <div className="px-2 py-1 bg-white/5 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest border border-white/5">SSL Secure</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentView;
