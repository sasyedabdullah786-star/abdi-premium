import Layout from '@/components/Layout';
import { useGamification } from '@/hooks/useGamification';
import { Trophy, Flame, Zap, Award, Medal } from 'lucide-react';

const Leaderboard = () => {
  const { leaderboard, badges, loading } = useGamification();

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (i === 1) return <Medal className="w-6 h-6 text-gray-300" />;
    if (i === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="font-bold text-muted-foreground">#{i + 1}</span>;
  };

  return (
    <Layout title="Leaderboard">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-muted-foreground mb-8">Top learners climbing the XP ladder 🚀</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Be the first to earn XP and lead the board!</p>
          </div>
        ) : (
          <div className="space-y-3 mb-12">
            {leaderboard.map((u, i) => (
              <div
                key={u.id}
                className={`glass-card p-4 flex items-center gap-4 hover-scale ${
                  i < 3 ? 'border-primary/30' : ''
                }`}
              >
                <div className="w-10 flex items-center justify-center">{rankIcon(i)}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                  {u.user_id.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">Learner {u.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">Level {u.level}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold">{u.xp}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>{u.current_streak}d</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-primary" /> Available Badges
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {badges.map(b => (
            <div key={b.id} className="glass-card p-4 text-center hover-scale">
              <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
