'use client';

interface GoalCenterProps {
  mainGoal: string;
  onClick?: () => void;
}

export function GoalCenter({ mainGoal, onClick }: GoalCenterProps) {
  return (
    <div
      className={`
        w-full h-full rounded-full
        bg-gradient-to-br from-teal-500 via-green-500 to-emerald-600
        shadow-2xl flex items-center justify-center
        cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-green-500/50
        border-4 border-white/30
        ${onClick ? 'hover:shadow-3xl' : ''}
      `}
      onClick={onClick}
    >
      <div className="text-center p-4 relative z-10 w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
        <h2 className="text-white font-bold text-xs sm:text-sm leading-tight relative z-10 drop-shadow-lg px-2">
          {mainGoal}
        </h2>
      </div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
    </div>
  );
}

