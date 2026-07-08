import React from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'

const ResumeCard = ({ resume: {id, companyName, jobTitle , feedback, imagePath} }: { resume: Resume }) => {
  return (
    <Link to={`/resumes/${id}`} className="resume-card" animate-in fade-in duration-1000>
        <div className="resume-card-header">
            <div className="flexr flex-col gap-1">
                <h2 className="text-black font-semibold text-sm break-words">{companyName}</h2>
                <h3 className="text-xs break-words text-gray-500">{jobTitle}</h3>
            </div>
            <div className="flex-shrink-0">
                <ScoreCircle score={feedback.overallScore} />
            </div>
        </div>
       <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full aspect-[700/991] overflow-hidden rounded-lg bg-white">
                <img 
                    src={imagePath}
                    alt="resume"
                    className="w-full h-full object-contain object-center"
                />
            </div>
        </div>
    </Link>
  )
}

export default ResumeCard