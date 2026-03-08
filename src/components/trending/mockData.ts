export interface MockUser {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  likes: number;
  isFollowed: boolean;
}

export interface MockVideo {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnail: string;
  caption: string;
  trackName: string;
  artist: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    username: 'rajesh_builder',
    name: 'Rajesh Kumar',
    avatar: 'https://i.pravatar.cc/150?img=11',
    bio: '🏗️ Master Mason | 15 yrs exp | Delhi NCR',
    followers: 12400,
    following: 340,
    likes: 98700,
    isFollowed: false,
  },
  {
    id: 'u2',
    username: 'priya_electrician',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: '⚡ Certified Electrician | Smart Home Expert',
    followers: 8900,
    following: 210,
    likes: 45200,
    isFollowed: false,
  },
  {
    id: 'u3',
    username: 'amit_plumber',
    name: 'Amit Verma',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: '🔧 Professional Plumber | 24/7 Service | Mumbai',
    followers: 5600,
    following: 180,
    likes: 23100,
    isFollowed: false,
  },
  {
    id: 'u4',
    username: 'sunita_painter',
    name: 'Sunita Devi',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: '🎨 Interior Painter & Designer | Jaipur',
    followers: 15200,
    following: 420,
    likes: 112000,
    isFollowed: false,
  },
];

// Using free sample vertical videos
const sampleVideos = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
];

export const mockVideos: MockVideo[] = [
  {
    id: 'v1', userId: 'u1', videoUrl: sampleVideos[0],
    thumbnail: 'https://picsum.photos/seed/v1/400/700',
    caption: '🏗️ See how we built this wall in just 2 hours! Professional masonry work. #construction #skill',
    trackName: 'Kaam Ka Dhun', artist: 'Rojgar Beats',
    likes: 3420, comments: 187, shares: 56, views: 24500, isLiked: false,
  },
  {
    id: 'v2', userId: 'u2', videoUrl: sampleVideos[1],
    thumbnail: 'https://picsum.photos/seed/v2/400/700',
    caption: '⚡ Smart home wiring tutorial - Save money, do it right! #electrician #tips',
    trackName: 'Bijli Ka Taar', artist: 'Skill FM',
    likes: 8910, comments: 432, shares: 198, views: 67800, isLiked: false,
  },
  {
    id: 'v3', userId: 'u3', videoUrl: sampleVideos[2],
    thumbnail: 'https://picsum.photos/seed/v3/400/700',
    caption: '🔧 Fixed a major leak in 30 mins! Watch the full process. #plumbing #repair',
    trackName: 'Paani Ka Raaz', artist: 'Work Vibes',
    likes: 2150, comments: 98, shares: 34, views: 15600, isLiked: false,
  },
  {
    id: 'v4', userId: 'u4', videoUrl: sampleVideos[3],
    thumbnail: 'https://picsum.photos/seed/v4/400/700',
    caption: '🎨 Room makeover in just 1 day! Before & after transformation. #painting #interior',
    trackName: 'Rang De', artist: 'Creative Sounds',
    likes: 12300, comments: 654, shares: 312, views: 89200, isLiked: false,
  },
  {
    id: 'v5', userId: 'u1', videoUrl: sampleVideos[4],
    thumbnail: 'https://picsum.photos/seed/v5/400/700',
    caption: '🧱 Tile fitting masterclass - Perfect alignment every time! #tiles #flooring',
    trackName: 'Kaam Ka Dhun', artist: 'Rojgar Beats',
    likes: 5670, comments: 234, shares: 89, views: 41200, isLiked: false,
  },
  {
    id: 'v6', userId: 'u2', videoUrl: sampleVideos[5],
    thumbnail: 'https://picsum.photos/seed/v6/400/700',
    caption: '💡 How to install a ceiling fan - Complete guide for beginners! #diy #electrical',
    trackName: 'Circuit Loop', artist: 'Skill FM',
    likes: 4320, comments: 178, shares: 67, views: 32100, isLiked: false,
  },
  {
    id: 'v7', userId: 'u4', videoUrl: sampleVideos[6],
    thumbnail: 'https://picsum.photos/seed/v7/400/700',
    caption: '🖌️ Texture painting technique that will blow your mind! #art #walldesign',
    trackName: 'Rang De', artist: 'Creative Sounds',
    likes: 18900, comments: 876, shares: 445, views: 134000, isLiked: false,
  },
  {
    id: 'v8', userId: 'u3', videoUrl: sampleVideos[7],
    thumbnail: 'https://picsum.photos/seed/v8/400/700',
    caption: '🚿 Bathroom renovation complete! Modern fixtures installed. #renovation #bathroom',
    trackName: 'Paani Ka Raaz', artist: 'Work Vibes',
    likes: 3890, comments: 156, shares: 78, views: 28700, isLiked: false,
  },
];

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}
