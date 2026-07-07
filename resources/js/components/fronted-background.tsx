import React from 'react'

const FrontendBackground = () => {
    return (
        <>
            {/* Cool teal-green — top left */}
            <div className="absolute top-[5%] left-[8%] w-[55vw] h-[55vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(53,116,107,0.24) 0%, transparent 70%)' }} />
            {/* Soft moss teal — centre right */}
            <div className="absolute top-[30%] right-[3%] w-[45vw] h-[45vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(91,144,132,0.16) 0%, transparent 70%)' }} />
            {/* Deep sea green — lower left */}
            <div className="absolute bottom-[28%] left-[2%] w-[40vw] h-[40vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(53,92,86,0.2) 0%, transparent 70%)' }} />
            {/* Frosted emerald — bottom right */}
            <div className="absolute bottom-[5%] right-[8%] w-[35vw] h-[35vw] rounded-full pointer-events-none z-0"
                style={{ background: 'radial-gradient(circle, rgba(28,77,69,0.22) 0%, transparent 70%)' }} />

            <div className="bg-grain" />
        </>
    )
}

export default FrontendBackground