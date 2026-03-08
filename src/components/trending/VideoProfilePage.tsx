import { ArrowLeft, Play, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockUser, MockVideo, formatCount } from './mockData';

interface VideoProfilePageProps {
  user: MockUser;
  videos: MockVideo[];
  isFollowed: boolean;
  onBack: () => void;
  onFollow: () => void;
  onVideoClick: (videoId: string) => void;
}

const VideoProfilePage = ({ user, videos, isFollowed, onBack, onFollow, onVideoClick }: VideoProfilePageProps) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-30 bg-neutral-950/90 backdrop-blur-md">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-neutral-800">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="font-bold text-lg">{user.username}</h2>
      </div>

      {/* Profile info */}
      <div className="px-6 pb-4 flex flex-col items-center">
        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-2 border-neutral-700 object-cover mb-3" />
        <h3 className="font-bold text-lg">{user.name}</h3>
        <p className="text-neutral-400 text-sm mt-1 text-center max-w-[250px]">{user.bio}</p>

        {/* Stats */}
        <div className="flex gap-8 mt-5">
          {[
            { label: 'Following', value: user.following },
            { label: 'Followers', value: user.followers },
            { label: 'Likes', value: user.likes },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold">{formatCount(s.value)}</p>
              <p className="text-neutral-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Follow button */}
        <Button
          onClick={onFollow}
          className={`mt-5 w-48 rounded-md font-semibold ${
            isFollowed
              ? 'bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-600'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </Button>
      </div>

      {/* Tab */}
      <div className="border-b border-neutral-800 flex justify-center py-2">
        <Grid3x3 className="w-5 h-5 text-white" />
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-0.5 p-0.5">
        {videos.map((v) => (
          <div
            key={v.id}
            onClick={() => onVideoClick(v.id)}
            className="relative aspect-[9/16] cursor-pointer group"
          >
            <img
              src={v.thumbnail}
              alt={v.caption}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-1 left-1 flex items-center gap-0.5">
              <Play className="w-3 h-3 text-white" fill="white" />
              <span className="text-white text-[10px] font-semibold">{formatCount(v.views)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoProfilePage;
