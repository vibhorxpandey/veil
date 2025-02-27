"use client"

import { useEffect, useRef, useState } from "react"

type Node = {
  x:number
  y:number
  vx:number
  vy:number
}

export default function AnalyzePage(){

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [degree,setDegree] = useState("")
  const [skills,setSkills] = useState("")
  const [interests,setInterests] = useState("")
  const [result,setResult] = useState("")
  const [loading,setLoading] = useState(false)

  useEffect(()=>{

    const canvas = canvasRef.current
    if(!canvas) return

    const ctx = canvas.getContext("2d")
    if(!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const nodes:Node[] = []

    for(let i=0;i<80;i++){
      nodes.push({
        x:Math.random()*canvas.width,
        y:Math.random()*canvas.height,
        vx:(Math.random()-0.5)*0.35,
        vy:(Math.random()-0.5)*0.35
      })
    }

    const draw = ()=>{

      ctx.clearRect(0,0,canvas.width,canvas.height)

      nodes.forEach(n=>{

        n.x += n.vx
        n.y += n.vy

        if(n.x<0||n.x>canvas.width) n.vx*=-1
        if(n.y<0||n.y>canvas.height) n.vy*=-1

        ctx.beginPath()
        ctx.arc(n.x,n.y,2.5,0,Math.PI*2)

        ctx.fillStyle="#00eaff"
        ctx.shadowColor="#00eaff"
        ctx.shadowBlur=12
        ctx.fill()

      })

      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){

          const dx = nodes[i].x-nodes[j].x
          const dy = nodes[i].y-nodes[j].y
          const dist = Math.sqrt(dx*dx+dy*dy)

          if(dist<150){

            ctx.beginPath()
            ctx.moveTo(nodes[i].x,nodes[i].y)
            ctx.lineTo(nodes[j].x,nodes[j].y)

            ctx.strokeStyle=`rgba(0,234,255,${1-dist/150})`
            ctx.lineWidth=1.2
            ctx.shadowColor="#00eaff"
            ctx.shadowBlur=8

            ctx.stroke()

          }
        }
      }

      requestAnimationFrame(draw)
    }

    draw()

  },[])


  const analyze = async ()=>{

    setLoading(true)

    const res = await fetch("/api/a=nalyze",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        degree,
        skills,
        interests
      })
    })

    const data = await res.json()

    setResult(data.result)
    setLoading(false)

  }


  return(

    <main style={{
      background:"black",
      minHeight:"100vh",
      overflow:"hidden",
      position:"relative"
    }}>

      <canvas
        ref={canvasRef}
        style={{
          position:"fixed",
          top:0,
          left:0,
          zIndex:0
        }}
      />

      <div
        style={{
          maxWidth:"900px",
          margin:"auto",
          padding:"70px 30px",
          color:"white",
          fontFamily:"sans-serif",
          position:"relative",
          zIndex:1
        }}
      >

      {/* FORM */}

      <h1 style={{fontSize:"46px",marginBottom:"30px"}}>
      Career Analyzer
      </h1>

      <input
        placeholder="Your Degree"
        value={degree}
        onChange={(e)=>setDegree(e.target.value)}
        style={{
          width:"100%",
          padding:"12px",
          marginBottom:"12px",
          borderRadius:"6px",
          border:"none"
        }}
      />

      <input
        placeholder="Your Skills"
        value={skills}
        onChange={(e)=>setSkills(e.target.value)}
        style={{
          width:"100%",
          padding:"12px",
          marginBottom:"12px",
          borderRadius:"6px",
          border:"none"
        }}
      />

      <input
        placeholder="Your Interests"
        value={interests}
        onChange={(e)=>setInterests(e.target.value)}
        style={{
          width:"100%",
          padding:"12px",
          marginBottom:"20px",
          borderRadius:"6px",
          border:"none"
        }}
      />

      <button
        onClick={analyze}
        style={{
          padding:"12px 24px",
          background:"#00eaff",
          color:"black",
          border:"none",
          borderRadius:"8px",
          fontWeight:"bold",
          cursor:"pointer"
        }}
      >
        {loading ? "Analyzing..." : "Check Career Analysis"}
      </button>
      <br/><br/>

<a
  href="/dashboard"
  style={{
    padding:"12px 24px",
    background:"transparent",
    color:"#00eaff",
    border:"1px solid #00eaff",
    borderRadius:"8px",
    textDecoration:"none",
    fontWeight:"bold"
  }}
>
  Open Dashboard
</a>


      {/* RESULT */}

      {result && (

        <div style={{marginTop:"50px"}}>

          <h2>Your Analysis</h2>

          <pre style={{whiteSpace:"pre-wrap"}}>
          {result}
          </pre>

        </div>

      )}


      {/* WHY VEIL */}

      <section style={{marginTop:"70px"}}>
        <h2>Why Veil Exists</h2>

        <p>
        Many students graduate with degrees but remain confused
        about their real career direction. Veil exists to bridge
        that gap between education and opportunity.
        </p>

        <p>
        By analyzing your skills and interests, Veil helps you
        discover career paths you may never have considered.
        </p>
      </section>


      {/* FOUNDER */}

      <section style={{marginTop:"50px"}}>

        <h2>Founder</h2>

        <p>
        Veil was created by <strong>Vibhor Pandey</strong>,
        a developer and AI enthusiast studying at
        <strong> UPES</strong> and a qualified
        <strong> NDA written examination candidate</strong>.
        </p>

        <p>
        GitHub:
        <a href="https://github.com/vibhorxpandey" target="_blank">
        github.com/vibhorxpandey
        </a>
        </p>

        <p>
        LinkedIn:
        <a href="https://linkedin.com/in/vibhor-pandey-baa6902b6" target="_blank">
        linkedin.com/in/vibhor-pandey-baa6902b6
        </a>
        </p>

        <p>
        Instagram:
        <a href="https://www.instagram.com/vibhorpandeyx" target="_blank">
        instagram.com/vibhorpandeyx
        </a>
        </p>

      </section>


      <p style={{
        marginTop:"60px",
        fontStyle:"italic",
        opacity:.7
      }}>
      “Careers are discovered, not guessed.
      Veil helps reveal the path hidden inside your skills.”
      </p>


      </div>

    </main>
  )
}