import { useState, useRef } from 'react'
import { isSupabaseEnabled, supabase } from './lib/supabase'

const SPECS = [
  // الصحة والتمريض
  'تمريض عام','تمريض طوارئ','تمريض ICU','مساعد طبيب','فني مختبر','فني أشعة','صيدلة','طب أسنان','طب بشري','فيزيوثيرابي','تغذية وحمية',
  // الهندسة والبناء
  'هندسة مدنية','هندسة كهربائية','هندسة ميكانيكية','هندسة برمجيات','هندسة معمارية','مساحة','نجارة','حدادة','بناء وأشغال','دهان وديكور','سباكة','تكييف وتبريد',
  // تقنية المعلومات
  'مطور ويب','مطور تطبيقات','محلل بيانات','أمن معلومات','مدير شبكات','دعم تقني','تصميم جرافيك',
  // المال والأعمال
  'محاسبة ومالية','مدقق مالي','محلل مالي','إدارة أعمال','تسويق ومبيعات','موارد بشرية','سكرتارية وإدارة',
  // السياحة والخدمات
  'سياحة وفندقة','طبخ وتغذية','نادل وخدمة','استقبال','تدبير منزلي','مرشد سياحي',
  // النقل والخدمات
  'سياقة خاصة','سياقة شاحنة','سياقة حافلة','لوجستيك ومستودعات','مشغّل رافعة',
  // التعليم والتدريب
  'تعليم رياضيات','تعليم علوم','تعليم لغة إنجليزية','تعليم لغة عربية','تدريب مهني','إرشاد تربوي',
  // الأمن والحماية
  'أمن وحراسة','مراقبة كاميرات','حارس VIP',
  // الزراعة والبيئة
  'زراعة وبستنة','بيطرة','صيد وأحواض',
  // التجميل والعناية
  'حلاقة رجالي','حلاقة نسائي','تجميل وميكياج','عناية بالأظافر','تمديد الرموش',
  'مساج وسبا','علاج بالأعشاب','تصفيف الشعر','صبغ الشعر','علاج فروة الرأس',
  // الرياضة واللياقة
  'مدرب لياقة بدنية','مدرب شخصي','مدرب سباحة','مدرب كرة قدم','مدرب فنون قتالية','يوغا وتأمل',
  // الرعاية والمساعدة
  'مساعد تمريض','مساعد طبيب','مرافق مريض','مربية أطفال','راعي مسنين','خدمة منزلية',
  // أخرى
  'خياطة وأزياء','طباعة ونشر','أخرى',
]
const CITIES = ['تونس العاصمة','صفاقس','سوسة','بنزرت','القيروان','قابس','مدنين','أريانة','بن عروس','نابل','المنستير','سيدي بوزيد','قفصة','الكاف','باجة','جندوبة','زغوان','أخرى']

async function uploadFile(file, folder) {
  if (!isSupabaseEnabled || !supabase) return null
  try {
    const ext = file.name.split('.').pop()
    const name = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('cvs-files').upload(name, file)
    if (error) throw error
    const { data } = supabase.storage.from('cvs-files').getPublicUrl(name)
    return data.publicUrl
  } catch { return null }
}

function UploadBox({ icon, title, sub, accept, file, onFile, multiple, files, onFiles }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)
  const handle = (f) => { if(multiple) { onFiles && onFiles(Array.from(f).filter(x=>x.size<10*1024*1024)) } else { if(f[0]&&f[0].size<10*1024*1024) onFile(f[0]) } }
  return (
    <div onClick={()=>ref.current.click()}
      onDragOver={e=>{e.preventDefault();setDrag(true)}}
      onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);handle(e.dataTransfer.files)}}
      style={{border:`2px dashed ${drag?'#1B3A6B':'#D1D5DB'}`,borderRadius:'14px',padding:'16px',textAlign:'center',cursor:'pointer',background:drag?'#EEF4FF':'#FAFAFA',transition:'all 0.2s'}}>
      <input ref={ref} type="file" accept={accept} multiple={multiple} style={{display:'none'}}
        onChange={e=>handle(e.target.files)} />
      <div style={{fontSize:'24px',marginBottom:'4px'}}>{icon}</div>
      <div style={{fontSize:'13px',fontWeight:700,color:'#1B3A6B',marginBottom:'2px'}}>{title}</div>
      <div style={{fontSize:'11px',color:'#9CA3AF'}}>{sub}</div>
      {file && <div style={{marginTop:'8px',background:'#EEF4FF',borderRadius:'8px',padding:'4px 10px',fontSize:'11px',color:'#1B3A6B',display:'inline-flex',alignItems:'center',gap:'6px'}}>📎 {file.name.slice(0,25)} <button onClick={e=>{e.stopPropagation();onFile(null)}} style={{background:'none',border:'none',color:'#DC2626',cursor:'pointer',fontSize:'13px'}}>✕</button></div>}
      {files && files.length>0 && <div style={{marginTop:'6px',display:'flex',flexWrap:'wrap',gap:'4px',justifyContent:'center'}}>{files.map((f,i)=><div key={i} style={{background:'#EEF4FF',borderRadius:'8px',padding:'3px 8px',fontSize:'11px',color:'#1B3A6B',display:'inline-flex',alignItems:'center',gap:'4px'}}>📎 {f.name.slice(0,15)} <button onClick={ev=>{ev.stopPropagation();onFiles&&onFiles(files.filter((_,idx)=>idx!==i))}} style={{background:'none',border:'none',color:'#DC2626',cursor:'pointer',fontSize:'12px'}}>✕</button></div>)}</div>}
    </div>
  )
}

function Input({label, req, opt, ...props}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#374151',marginBottom:'5px'}}>
        {label} {req&&<span style={{color:'#DC2626'}}>*</span>} {opt&&<span style={{color:'#9CA3AF',fontWeight:400,fontSize:'11px'}}>(اختياري)</span>}
      </label>
      <input {...props}
        onFocus={e=>{setFocused(true);props.onFocus&&props.onFocus(e)}}
        onBlur={e=>{setFocused(false);props.onBlur&&props.onBlur(e)}}
        style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:`2px solid ${focused?'#1B3A6B':'#E2E8F0'}`,background:'#F8FAFC',fontSize:'14px',color:'#111827',outline:'none',fontFamily:"'Cairo',sans-serif",boxSizing:'border-box',boxShadow:focused?'0 0 0 3px rgba(27,58,107,0.08)':'none',transition:'all 0.2s',...props.style}} />
    </div>
  )
}

function Select({label, req, opt, children, ...props}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#374151',marginBottom:'5px'}}>
        {label} {req&&<span style={{color:'#DC2626'}}>*</span>} {opt&&<span style={{color:'#9CA3AF',fontWeight:400,fontSize:'11px'}}>(اختياري)</span>}
      </label>
      <select {...props}
        onFocus={e=>{setFocused(true);props.onFocus&&props.onFocus(e)}}
        onBlur={e=>{setFocused(false);props.onBlur&&props.onBlur(e)}}
        style={{width:'100%',padding:'11px 12px',borderRadius:'12px',border:`2px solid ${focused?'#1B3A6B':'#E2E8F0'}`,background:'#F8FAFC',fontSize:'14px',outline:'none',fontFamily:"'Cairo',sans-serif",boxSizing:'border-box',boxShadow:focused?'0 0 0 3px rgba(27,58,107,0.08)':'none',transition:'all 0.2s',...props.style}}>
        {children}
      </select>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({name:'',phone:'',email:'',spec:'',exp:'0',age:'',city:'',skills:'',notes:''})
  const [cvFile, setCvFile] = useState(null)
  const [ppFile, setPpFile] = useState(null)
  const [diFiles, setDiFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}))

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('يرجى إدخال الاسم الكامل'); return }
    if (!form.phone.trim()) { setError('يرجى إدخال رقم الهاتف'); return }
    if (!form.spec) { setError('يرجى اختيار التخصص'); return }
    setLoading(true); setError('')
    try {
      let cvUrl='', ppUrl='', diUrls=[]
      if (cvFile) { setProgress('رفع السيرة الذاتية...'); cvUrl=await uploadFile(cvFile,'cvs')||'' }
      if (ppFile) { setProgress('رفع جواز السفر...'); ppUrl=await uploadFile(ppFile,'passports')||'' }
      for (const f of diFiles) { setProgress('رفع الشهائد...'); const u=await uploadFile(f,'diplomas'); if(u) diUrls.push(u) }
      setProgress('حفظ البيانات...')
      const notes=[form.notes, form.email?`Email: ${form.email}`:'', ppUrl?`جواز: ${ppUrl}`:'', diUrls.length>0?`شهائد: ${diUrls.join(' | ')}`:''].filter(Boolean).join(' | ')
      const record={name:form.name.trim(),spec:form.spec,age:parseInt(form.age)||0,exp:parseInt(form.exp)||0,city:form.city||'غير محدد',phone:form.phone.trim(),skills:form.skills,source:'public',notes,file_url:cvUrl||null,file_name:cvFile?.name||null,date:new Date().toISOString().split('T')[0]}
      if (isSupabaseEnabled&&supabase) { const {error:err}=await supabase.from('cvs').insert([record]); if(err) throw err }
      setProgress('')
      // إشعار واتساب للمترشح
      const confirmMsg = encodeURIComponent(`السيد/السيدة ${form.name.trim()}،\n\nشكراً على تسجيلك في بيرق العرب للتوظيف بالخارج ✅\n\nتم استلام ملفك وسنتواصل معك في أقرب وقت.\n\nللاستفسار: (+216) 98 656 680\n💬 واتساب: 98 656 680`)
      const phone = form.phone.trim().replace(/[\s\-\(\)\+]/g,'')
      const waNum = phone.startsWith('216') ? phone : '216'+phone
      setTimeout(() => window.open(`https://wa.me/${waNum}?text=${confirmMsg}`, '_blank'), 1500)
      setStep(2)
    } catch { setError('حدث خطأ — يرجى المحاولة مجدداً'); setProgress('') }
    setLoading(false)
  }

  // ===== صفحة النجاح =====
  if (step===2) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cairo',sans-serif",direction:'rtl',position:'relative',overflow:'hidden'}}>
      <div style={{position:'fixed',inset:0,background:'url(/bg-bayraq.jpg) center/cover',filter:'brightness(0.2)'}}></div>
      <div style={{position:'fixed',inset:0,background:'linear-gradient(135deg,rgba(27,58,107,0.9),rgba(13,36,71,0.85))'}}></div>
      <div style={{position:'relative',zIndex:10,width:'100%',maxWidth:'420px',margin:'24px',background:'white',borderRadius:'28px',padding:'40px 32px',textAlign:'center',boxShadow:'0 25px 80px rgba(0,0,0,0.4)'}}>
        <div style={{fontSize:'64px',marginBottom:'12px'}}>🎉</div>
        <h2 style={{fontSize:'24px',fontWeight:900,color:'#1B3A6B',margin:'0 0 12px'}}>تم التسجيل بنجاح!</h2>
        <p style={{fontSize:'14px',color:'#6B7280',lineHeight:1.7,marginBottom:'20px'}}>شكراً <strong style={{color:'#1B3A6B'}}>{form.name}</strong>، تم إضافة ملفك في قاعدة بيانات بيرق العرب للتوظيف بالخارج.</p>
        <div style={{background:'#EEF4FF',borderRadius:'16px',padding:'16px',marginBottom:'20px',border:'1px solid rgba(27,58,107,0.1)'}}>
          <div style={{fontSize:'12px',color:'#1B3A6B',fontWeight:700,marginBottom:'6px'}}>سنتواصل معك قريباً على:</div>
          <div style={{fontSize:'22px',fontWeight:900,color:'#1B3A6B',fontFamily:'monospace',direction:'ltr'}}>{form.phone}</div>
        </div>
        {(cvFile||ppFile||diFiles.length>0)&&<div style={{background:'#F0FDF4',borderRadius:'12px',padding:'10px 14px',marginBottom:'16px',fontSize:'12px',color:'#15803d',border:'1px solid #BBF7D0'}}>✅ تم رفع {[cvFile&&'السيرة الذاتية',ppFile&&'جواز السفر',diFiles.length>0&&`${diFiles.length} شهادة`].filter(Boolean).join(' و ')}</div>}
        <div style={{borderTop:'1px solid #F1F5F9',paddingTop:'16px',fontSize:'12px',color:'#9CA3AF',lineHeight:2.2}}>
          <div dir="ltr">(+216) 98 656 680 / 98 656 680</div>
          <div style={{color:'#25d366'}} dir="ltr">💬 98 656 680</div>
          <div>bayrakdirection@gmail.com</div>
        </div>
        <button onClick={()=>{setStep(1);setForm({name:'',phone:'',email:'',spec:'',exp:'0',age:'',city:'',skills:'',notes:''});setCvFile(null);setPpFile(null);setDiFiles([])}}
          style={{background:'none',border:'none',color:'#1B3A6B',fontSize:'13px',cursor:'pointer',marginTop:'16px',fontFamily:"'Cairo',sans-serif",fontWeight:600}}>
          ← تسجيل شخص آخر
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',fontFamily:"'Cairo',sans-serif",direction:'rtl',display:'flex',flexDirection:'column',position:'relative'}}>

      {/* ===== خلفية ثابتة ===== */}
      <div style={{position:'fixed',inset:0,zIndex:0,background:'url(/bg-bayraq.jpg) center/cover no-repeat'}}></div>
      <div style={{position:'fixed',inset:0,zIndex:1,background:'linear-gradient(135deg, rgba(10,15,40,0.92) 0%, rgba(27,58,107,0.85) 50%, rgba(10,15,40,0.92) 100%)'}}></div>

      {/* ===== المحتوى الرئيسي ===== */}
      <div style={{position:'relative',zIndex:10,flex:1,display:'flex',minHeight:'100vh',flexWrap:'wrap'}}>

        {/* ===== الجانب الأيمن — صورة الشركة ===== */}
        <div className="side-panel" style={{flex:'0 0 42%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 32px',position:'relative'}}>
          {/* الصورة */}
          <div style={{width:'100%',maxWidth:'340px',borderRadius:'24px',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.5)',border:'3px solid rgba(201,162,39,0.4)'}}>
            <img src="/bg-bayraq.jpg" alt="بيرق العرب"
              style={{width:'100%',height:'auto',display:'block'}}
              onError={e=>e.target.style.display='none'} />
          </div>

          {/* معلومات الاتصال تحت الصورة */}
          <div style={{marginTop:'24px',textAlign:'center',width:'100%',maxWidth:'340px'}}>
            <div style={{background:'rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.12)',backdropFilter:'blur(10px)'}}>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.9)',fontWeight:600,marginBottom:'8px'}}>تواصل معنا</div>
              <div style={{fontSize:'13px',color:'rgba(255,255,255,0.8)',marginBottom:'6px'}} dir="ltr">(+216) 98 656 680 / 98 656 680</div>
              <a href="https://wa.me/21698656680" style={{color:'#4ADE80',textDecoration:'none',fontSize:'14px',fontWeight:700,display:'block',marginBottom:'4px'}} dir="ltr">💬 98 656 680</a>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.45)'}}>17 Rue de Marseille, Tunis 1002</div>
            </div>
          </div>
        </div>

        {/* ===== الجانب الأيسر — نموذج التسجيل ===== */}
        <div style={{flex:1,minWidth:'300px',overflowY:'auto',padding:'24px 20px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{maxWidth:'480px',margin:'0 auto',width:'100%'}}>

            {/* العنوان */}
            <div style={{marginBottom:'24px'}}>
              <h1 style={{fontSize:'26px',fontWeight:900,color:'white',margin:'0 0 6px',textShadow:'0 2px 10px rgba(0,0,0,0.5)'}}>
                استمارة التوظيف بالخارج
              </h1>
              <div style={{fontSize:'14px',color:'#E8C44A',fontWeight:600,marginBottom:'4px'}}>بيرق العرب — BAYRAK ELARAB</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.6)'}}>أدخل بياناتك وسنتواصل معك في أقرب وقت</div>
            </div>

            {/* البطاقة */}
            <div style={{background:'rgba(255,255,255,0.97)',borderRadius:'24px',padding:'28px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.9)'}}>

              {/* المعلومات الشخصية */}
              <div style={{fontSize:'13px',fontWeight:700,color:'#1B3A6B',marginBottom:'14px',paddingBottom:'8px',borderBottom:'2px solid #EEF4FF',display:'flex',alignItems:'center',gap:'6px'}}>
                <span>👤</span> المعلومات الشخصية
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'12px',marginBottom:'16px'}}>
                <div style={{gridColumn:'1/-1'}}>
                  <Input label="الاسم الكامل" req value={form.name} onChange={set('name')} placeholder="أدخل اسمك الكامل" autoFocus />
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <Input label="رقم الهاتف / واتساب" req value={form.phone} onChange={set('phone')} placeholder="21652123456" type="tel" style={{direction:'ltr'}} />
                </div>
                <div>
                  <Input label="البريد الإلكتروني" opt value={form.email} onChange={set('email')} placeholder="example@mail.com" type="email" style={{direction:'ltr'}} />
                </div>
                <div>
                  <Input label="العمر" opt value={form.age} onChange={set('age')} placeholder="25" type="number" min="18" max="65" />
                </div>
              </div>

              {/* المعلومات المهنية */}
              <div style={{fontSize:'13px',fontWeight:700,color:'#1B3A6B',marginBottom:'14px',paddingBottom:'8px',borderBottom:'2px solid #EEF4FF',display:'flex',alignItems:'center',gap:'6px'}}>
                <span>💼</span> المعلومات المهنية
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:'12px',marginBottom:'16px'}}>
                <div style={{gridColumn:'1/-1'}}>
                  <Select label="التخصص / المهنة" req value={form.spec} onChange={set('spec')} style={{color:form.spec?'#111827':'#9CA3AF'}}>
                    <option value="">اختر تخصصك...</option>
                    {SPECS.map(s=><option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div>
                  <Select label="المدينة" value={form.city} onChange={set('city')} style={{color:form.city?'#111827':'#9CA3AF'}}>
                    <option value="">المدينة...</option>
                    {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div>
                  <Select label="سنوات الخبرة" value={form.exp} onChange={set('exp')}>
                    <option value="0">بدون خبرة</option>
                    <option value="1">سنة</option>
                    <option value="2">سنتان</option>
                    <option value="3">3 سنوات</option>
                    <option value="5">5 سنوات</option>
                    <option value="8">8 سنوات</option>
                    <option value="10">10 سنوات+</option>
                  </Select>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <Input label="المهارات" opt value={form.skills} onChange={set('skills')} placeholder="مثال: Excel، فرنسية، رخصة قيادة..." />
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={{display:'block',fontSize:'12px',fontWeight:600,color:'#374151',marginBottom:'5px'}}>ملاحظات <span style={{color:'#9CA3AF',fontWeight:400,fontSize:'11px'}}>(اختياري)</span></label>
                  <textarea value={form.notes} onChange={set('notes')} rows={2} placeholder="أي معلومات إضافية..."
                    style={{width:'100%',padding:'11px 14px',borderRadius:'12px',border:'2px solid #E2E8F0',background:'#F8FAFC',fontSize:'14px',color:'#111827',outline:'none',fontFamily:"'Cairo',sans-serif",boxSizing:'border-box',resize:'none',lineHeight:1.6}}
                    onFocus={e=>{e.target.style.borderColor='#1B3A6B';e.target.style.boxShadow='0 0 0 3px rgba(27,58,107,0.08)'}}
                    onBlur={e=>{e.target.style.borderColor='#E2E8F0';e.target.style.boxShadow='none'}} />
                </div>
              </div>

              {/* الملفات */}
              <div style={{fontSize:'13px',fontWeight:700,color:'#1B3A6B',marginBottom:'14px',paddingBottom:'8px',borderBottom:'2px solid #EEF4FF',display:'flex',alignItems:'center',gap:'6px'}}>
                <span>📎</span> الملفات <span style={{color:'#9CA3AF',fontWeight:400,fontSize:'11px',marginRight:'4px'}}>(كل الملفات اختيارية)</span>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',gap:'10px',marginBottom:'16px'}}>
                <UploadBox icon="📄" title="السيرة الذاتية" sub="PDF أو Word" accept=".pdf,.doc,.docx" file={cvFile} onFile={setCvFile} />
                <UploadBox icon="🛂" title="جواز السفر" sub="صورة أو PDF" accept="image/*,.pdf" file={ppFile} onFile={setPpFile} />
                <div style={{gridColumn:'1/-1'}}>
                  <UploadBox icon="🎓" title="الشهائد العلمية" sub="عدة ملفات — حجم أقصى 10MB لكل ملف" accept="image/*,.pdf" multiple files={diFiles} onFiles={f=>setDiFiles(p=>[...p,...f].slice(0,5))} />
                </div>
              </div>

              {error && <div style={{background:'#FEF2F2',border:'1px solid #FECACA',borderRadius:'12px',padding:'12px 14px',fontSize:'12px',color:'#DC2626',marginBottom:'12px'}}>⚠️ {error}</div>}
              {progress && <div style={{background:'#EEF4FF',border:'1px solid rgba(27,58,107,0.15)',borderRadius:'12px',padding:'12px 14px',fontSize:'12px',color:'#1B3A6B',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}><span>⏳</span> {progress}</div>}

              <button onClick={handleSubmit}
                disabled={loading||!form.name.trim()||!form.phone.trim()||!form.spec}
                style={{width:'100%',padding:'15px',borderRadius:'16px',background: loading||!form.name.trim()||!form.phone.trim()||!form.spec?'#94A3B8':'linear-gradient(135deg,#1B3A6B,#0D2447)',color:'white',fontSize:'16px',fontWeight:900,border:'none',cursor:loading||!form.name.trim()||!form.phone.trim()||!form.spec?'not-allowed':'pointer',fontFamily:"'Cairo',sans-serif",boxShadow:'0 8px 25px rgba(27,58,107,0.3)',transition:'all 0.2s'}}>
                {loading ? '⟳ جارٍ الإرسال...' : '✅ إرسال طلب التوظيف'}
              </button>

              <p style={{fontSize:'11px',textAlign:'center',color:'#9CA3AF',marginTop:'10px',marginBottom:0}}>
                بالإرسال توافق على حفظ بياناتك في قاعدة بيانات بيرق العرب
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* الفوتر */}
      <div style={{position:'relative',zIndex:10,textAlign:'center',padding:'12px',fontSize:'11px',color:'rgba(255,255,255,0.35)',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        © 2025 بيرق العرب للتوظيف بالخارج
      </div>

      {/* CSS للشاشات الصغيرة */}
      <style>{`
        @media (max-width: 768px) {
          .side-panel { display: none !important; }
        }
        @media (max-width: 480px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  )
}
