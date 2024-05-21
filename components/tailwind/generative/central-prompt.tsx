"use client";
import React from 'react';
import { SparklesIcon } from 'lucide-react';

const CentralPrompt = () => {
    const [prompt, setPrompt] = React.useState("");

    return (
        <>
            <div className="relative w-full">
                <svg className="absolute top-3 left-3 w-7 h-7" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><rect fill="none" height="256" width="256" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="216" x2="216" y1="128" y2="176" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="192" x2="240" y1="152" y2="152" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="84" x2="84" y1="40" y2="80" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="64" x2="104" y1="60" y2="60" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="168" x2="168" y1="184" y2="216" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="152" x2="184" y1="200" y2="200" /><rect fill="none" height="45.25" rx="8" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" transform="translate(-53 128) rotate(-45)" width="226.3" x="14.9" y="105.4" /><line fill="none" stroke="purple" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="144" x2="176" y1="80" y2="112" /></svg>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full text-xl p-3 pl-14" rows={5} placeholder="Write with AI.."></textarea>

                <button className="absolute top-3 right-4 bg-violet-700 hover:bg-violet-950 flex justify-center items-center text-white font-bold p-2 px-6 rounded-lg"
                    onClick={() => { }}
                >
                    <SparklesIcon className="mx-2" />
                    Generate</button>
            </div>


        </>
    )
}

export default CentralPrompt
