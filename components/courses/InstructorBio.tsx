"use client";

import * as React from "react";
import { ExternalLink, Linkedin } from "lucide-react";

interface InstructorBioProps {
  instructor: {
    id: string;
    name: string;
    image: string | null;
  };
  profile: {
    bio: string | null;
    headline: string | null;
    website: string | null;
    linkedinUrl: string | null;
    expertise: string[];
  } | null;
}

export function InstructorBio({ instructor, profile }: InstructorBioProps) {
  const initials = instructor.name.slice(0, 2).toUpperCase();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold font-display tracking-tight text-slate-900 border-l-4 border-primary pl-4">
        Your Instructor
      </h2>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
        {/* Avatar */}
        {instructor.image ? (
          <img
            src={instructor.image}
            alt={`${instructor.name} - Instructor`}
            className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md shrink-0"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-white shadow-md flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {initials}
          </div>
        )}

        <div className="space-y-2 flex-1 min-w-0">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{instructor.name}</h3>
            {profile?.headline && (
              <p className="text-sm font-medium text-primary">{profile.headline}</p>
            )}
          </div>

          {profile?.expertise && profile.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {profile?.bio && (
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          )}

          {!profile?.bio && !profile?.headline && (
            <p className="text-sm text-slate-400 italic">
              Instructor profile coming soon.
            </p>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 pt-1">
            {profile?.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
                LinkedIn
              </a>
            )}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
