import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MAP_COACHES = [
  { id:1,  name:'Ana García',    initials:'AG', lat:19.4326,  lng:-99.1332,  city:'Ciudad de México', country:'MX', status:'available',  rating:4.9, sessions:124, specialty:'Liderazgo' },
  { id:2,  name:'Carlos Ruiz',   initials:'CR', lat:4.7110,   lng:-74.0721,  city:'Bogotá',           country:'CO', status:'in-session', rating:4.8, sessions:98,  specialty:'Comunicación' },
  { id:3,  name:'María López',   initials:'ML', lat:-33.4489, lng:-70.6693,  city:'Santiago',          country:'CL', status:'available',  rating:4.7, sessions:87,  specialty:'Cambio' },
  { id:4,  name:'John Smith',    initials:'JS', lat:40.7128,  lng:-74.0060,  city:'Nueva York',        country:'US', status:'in-session', rating:4.6, sessions:76,  specialty:'Teams' },
  { id:5,  name:'Laura Torres',  initials:'LT', lat:41.3851,  lng:2.1734,    city:'Barcelona',         country:'ES', status:'available',  rating:4.5, sessions:65,  specialty:'Estrategia' },
  { id:6,  name:'Diego Morales', initials:'DM', lat:-12.0464, lng:-77.0428,  city:'Lima',              country:'PE', status:'available',  rating:4.9, sessions:110, specialty:'Ventas' },
  { id:7,  name:'Sarah Chen',    initials:'SC', lat:1.3521,   lng:103.8198,  city:'Singapur',          country:'SG', status:'available',  rating:4.8, sessions:92,  specialty:'Innovación' },
  { id:8,  name:'Marco Bianchi', initials:'MB', lat:45.4642,  lng:9.1900,    city:'Milán',             country:'IT', status:'top-rated',  rating:5.0, sessions:145, specialty:'Executive' },
  { id:9,  name:'Camila Souza',  initials:'CS', lat:-23.5505, lng:-46.6333,  city:'São Paulo',         country:'BR', status:'available',  rating:4.7, sessions:83,  specialty:'Liderazgo' },
  { id:10, name:'Raj Patel',     initials:'RP', lat:28.6139,  lng:77.2090,   city:'Nueva Delhi',       country:'IN', status:'in-session', rating:4.6, sessions:71,  specialty:'Mindfulness' },
]

const STATUS_COLORS = {
  'available':  '#10B981',
  'in-session': '#0EA5E9',
  'top-rated':  '#C9A84C',
}

const STATUS_LABELS = {
  'available':  'Disponible',
  'in-session': 'En sesión',
  'top-rated':  'Top rated',
}

function createMarkerIcon(coach) {
  const color = STATUS_COLORS[coach.status] || '#10B981'
  return new DivIcon({
    className: '',
    html: `
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: ${color}18;
        border: 2px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        color: ${color};
        font-family: 'JetBrains Mono', monospace;
        position: relative;
        box-shadow: 0 0 12px ${color}66, 0 0 24px ${color}22;
        cursor: pointer;
      ">
        <div style="
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid ${color}44;
          animation: ripple 2s ease-out infinite;
          pointer-events: none;
        "></div>
        ${coach.initials}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  })
}

function StarsPopup({ rating }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:2}}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#C9A84C' : 'rgba(90,96,112,0.4)'}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{fontFamily:'JetBrains Mono,monospace', fontSize:10, color:'#5A6070', marginLeft:3}}>{rating}</span>
    </div>
  )
}

export default function CoachMap({ height = '400px', zoom = 2 }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? MAP_COACHES
    : filter === 'available'
    ? MAP_COACHES.filter(c => c.status === 'available' || c.status === 'top-rated')
    : filter === 'in-session'
    ? MAP_COACHES.filter(c => c.status === 'in-session')
    : MAP_COACHES.filter(c => c.status === 'top-rated')

  const availableCount  = MAP_COACHES.filter(c => c.status === 'available').length
  const inSessionCount  = MAP_COACHES.filter(c => c.status === 'in-session').length
  const countrySet      = new Set(MAP_COACHES.map(c => c.country))

  const FILTERS = [
    { key:'all',        label:'Todos' },
    { key:'available',  label:'Disponibles' },
    { key:'in-session', label:'En sesión' },
    { key:'top',        label:'Top' },
  ]

  return (
    <div style={{ height, borderRadius:16, overflow:'hidden', border:'1px solid rgba(14,165,233,0.15)', position:'relative' }}>
      {/* Filter controls — top right */}
      <div style={{
        position:'absolute', top:12, right:12, zIndex:1000,
        display:'flex', gap:4,
        background:'rgba(8,10,15,0.88)',
        border:'1px solid rgba(14,165,233,0.2)',
        borderRadius:10,
        padding:'4px',
        backdropFilter:'blur(12px)',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding:'4px 10px',
              borderRadius:7,
              border:'none',
              fontSize:11,
              fontFamily:'JetBrains Mono, monospace',
              fontWeight:600,
              cursor:'pointer',
              background: filter === f.key ? '#0EA5E9' : 'transparent',
              color: filter === f.key ? '#080A0F' : '#5A6070',
              transition:'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapContainer
        center={[20, 0]}
        zoom={zoom}
        style={{ height:'100%', width:'100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {filtered.map((coach) => (
          <Marker
            key={coach.id}
            position={[coach.lat, coach.lng]}
            icon={createMarkerIcon(coach)}
          >
            <Popup
              closeButton={false}
              maxWidth={220}
            >
              <div style={{
                minWidth:200,
                background:'rgba(8,10,15,0.98)',
                fontFamily:'Inter, sans-serif',
                padding:'2px 0',
              }}>
                {/* Coach header */}
                <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:10}}>
                  <div style={{
                    width:36, height:36, borderRadius:'50%',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'JetBrains Mono,monospace', fontSize:11, fontWeight:700,
                    background:`${STATUS_COLORS[coach.status]}22`,
                    color: STATUS_COLORS[coach.status],
                    border:`1.5px solid ${STATUS_COLORS[coach.status]}55`,
                    flexShrink:0,
                  }}>
                    {coach.initials}
                  </div>
                  <div>
                    <p style={{color:'#E8EAF0', fontWeight:600, fontSize:13, margin:0}}>{coach.name}</p>
                    <p style={{color:'#5A6070', fontSize:11, margin:'2px 0 0', fontFamily:'JetBrains Mono,monospace'}}>{coach.specialty}</p>
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  padding:'3px 8px', borderRadius:6,
                  background:`${STATUS_COLORS[coach.status]}18`,
                  border:`1px solid ${STATUS_COLORS[coach.status]}44`,
                  marginBottom:8,
                }}>
                  <span style={{width:6, height:6, borderRadius:'50%', background:STATUS_COLORS[coach.status], display:'inline-block'}}/>
                  <span style={{fontSize:11, color:STATUS_COLORS[coach.status], fontFamily:'JetBrains Mono,monospace', fontWeight:600}}>
                    {STATUS_LABELS[coach.status]}
                  </span>
                </div>

                {/* Stats */}
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                  <StarsPopup rating={coach.rating}/>
                  <span style={{fontSize:11, color:'#5A6070', fontFamily:'JetBrains Mono,monospace'}}>{coach.sessions} sesiones</span>
                </div>

                <p style={{fontSize:11, color:'#5A6070', fontFamily:'JetBrains Mono,monospace', marginBottom:10}}>
                  📍 {coach.city}, {coach.country}
                </p>

                {/* Contact button */}
                <button style={{
                  width:'100%', padding:'7px 0', borderRadius:8, border:'none', cursor:'pointer',
                  background:'linear-gradient(135deg, #C9A84C, #E8C97A)',
                  color:'#080A0F', fontSize:12, fontWeight:700, fontFamily:'Inter, sans-serif',
                }}>
                  Contactar →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom stats overlay */}
      <div style={{
        position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', zIndex:1000,
        display:'flex', gap:6,
        background:'rgba(8,10,15,0.88)',
        border:'1px solid rgba(14,165,233,0.15)',
        borderRadius:12,
        padding:'8px 16px',
        backdropFilter:'blur(16px)',
        whiteSpace:'nowrap',
      }}>
        {[
          { icon:'🌎', val:`${countrySet.size} Países` },
          { icon:'👥', val:`${MAP_COACHES.length} Coaches` },
          { icon:'🟢', val:`${availableCount} Disponibles` },
          { icon:'🔵', val:`${inSessionCount} En sesión` },
        ].map(s => (
          <div key={s.val} style={{display:'flex', alignItems:'center', gap:5, padding:'0 8px', borderRight:'1px solid rgba(255,255,255,0.06)'}}>
            <span style={{fontSize:12}}>{s.icon}</span>
            <span style={{fontSize:11, fontFamily:'JetBrains Mono,monospace', color:'#A8C4D4', fontWeight:600}}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
