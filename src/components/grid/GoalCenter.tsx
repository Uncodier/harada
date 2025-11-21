'use client';

interface GoalCenterProps {
  mainGoal: string;
  onClick?: () => void;
}

export function GoalCenter({ mainGoal, onClick }: GoalCenterProps) {
  return (
    <div
      className={`
        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        w-52 h-52 rounded-full
        bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700
        shadow-2xl flex items-center justify-center
        cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50
        border-4 border-white/20
        ${onClick ? 'hover:shadow-3xl' : ''}
        animate-scale-in
      `}
      onClick={onClick}
    >
      <div className="text-center p-6 relative z-10">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-xl"></div>
        <h2 className="text-white font-bold text-base sm:text-lg leading-tight relative z-10 drop-shadow-lg">
          {mainGoal}
        </h2>
      </div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
    </div>
  );
}

