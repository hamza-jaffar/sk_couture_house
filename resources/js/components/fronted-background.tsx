import { FOREST, OXBLOOD } from '@/constant/colors'
import React from 'react'

const FrontendBackground = () => {
    return (
        <>
            {/* Forest green — top left */}
            <div className="absolute top-[5%] left-[8%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(30,77,48,0.28) 0%, transparent 70%)' }} />
            {/* Antique brass — centre right */}
            <div className="absolute top-[30%] right-[3%] w-[45vw] h-[45vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(184,149,42,0.14) 0%, transparent 70%)' }} />
            {/* Oxblood — lower left */}
            <div className="absolute bottom-[28%] left-[2%] w-[40vw] h-[40vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(122,28,28,0.18) 0%, transparent 70%)' }} />
            {/* Walnut — bottom right */}
            <div className="absolute bottom-[5%] right-[8%] w-[35vw] h-[35vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(77,43,15,0.22) 0%, transparent 70%)' }} />

            <div className="bg-grain" />
        </>
    )
}

export default FrontendBackground