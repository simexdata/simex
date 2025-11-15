import React from 'react'

export default function LoginScreen({ onLogin }){
  const [mode,setMode]=React.useState('login') // 'login' | 'apply'
  const [email,setEmail]=React.useState('')
  const [pass,setPass]=React.useState('')
  const [name,setName]=React.useState('')
  const [phone,setPhone]=React.useState('')
  const [files,setFiles]=React.useState([])

  const handleLogin=(e)=>{
    e.preventDefault()
    try{ localStorage.setItem('loggedIn','1'); localStorage.setItem('currentUserId','e1'); }catch{}
    onLogin?.()
  }
  const handleApply=(e)=>{
    e.preventDefault()
    try{
      const apps=JSON.parse(localStorage.getItem('applications')||'[]')
      const entries = files? Array.from(files).map(f=>({ name:f.name, size:f.size, type:f.type })) : []
      apps.push({ name, email, phone, files: entries, createdAt: new Date().toISOString() })
      localStorage.setItem('applications', JSON.stringify(apps))
    }catch{}
    alert('Заявлението е изпратено (локално запазено).')
  }

  return (
    <div className="login-wrap" style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'linear-gradient(180deg, #e6ecf6, #ffffff)'}}>
      <div className="login-grid" style={{display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(300px, 360px))'}}>
        <div className="card" style={{padding:16, border:'1px solid #d1d9e6', borderRadius:16, background:'#fff', boxShadow:'0 8px 24px rgba(0,0,0,.08)'}}>
          <h3 style={{marginTop:0}}>Вход</h3>
          <form onSubmit={handleLogin} className="grid" style={{display:'grid', gap:8}}>
            <input className="input" type="email" placeholder="Имейл" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="input" type="password" placeholder="Парола" value={pass} onChange={e=>setPass(e.target.value)} required/>
            <button className="btn">Влез</button>
          </form>
          <div style={{marginTop:8,fontSize:12}}>
            Или <button className="btn xs" onClick={()=>setMode('apply')}>Кандидатствай за работа</button>
          </div>
        </div>

        <div className="card" style={{padding:16, border:'1px solid #d1d9e6', borderRadius:16, background:'#fff', boxShadow:'0 8px 24px rgba(0,0,0,.08)'}}>
          <h3 style={{marginTop:0}}>Кандидатствай за работа</h3>
          <form onSubmit={handleApply} className="grid" style={{display:'grid', gap:8}}>
            <input className="input" placeholder="Име" value={name} onChange={e=>setName(e.target.value)} required/>
            <input className="input" type="email" placeholder="Имейл" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input className="input" placeholder="Телефон" value={phone} onChange={e=>setPhone(e.target.value)} required/>
            <label className="btn">
              Качи документи
              <input type="file" style={{display:'none'}} multiple onChange={e=>setFiles(e.target.files)} />
            </label>
            <button className="btn">Изпрати</button>
          </form>
        </div>
      </div>
    </div>
  )
}