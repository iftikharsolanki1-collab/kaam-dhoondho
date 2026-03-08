import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commentCount: number;
}

const mockComments = [
  { id: '1', user: 'mohit_kumar', avatar: 'https://i.pravatar.cc/40?img=3', text: 'बहुत बढ़िया काम! 🔥', time: '2h' },
  { id: '2', user: 'ritu_singh', avatar: 'https://i.pravatar.cc/40?img=6', text: 'Ye kaise kiya bhai? Tutorial banao please', time: '4h' },
  { id: '3', user: 'deepak_99', avatar: 'https://i.pravatar.cc/40?img=8', text: 'Professional quality! Respect 💪', time: '6h' },
  { id: '4', user: 'anita_didi', avatar: 'https://i.pravatar.cc/40?img=10', text: 'Mujhe bhi aisa kaam chahiye apne ghar ke liye', time: '8h' },
  { id: '5', user: 'vikram_joshi', avatar: 'https://i.pravatar.cc/40?img=14', text: 'Kitna charge karte ho? DM karo', time: '12h' },
];

const CommentSheet = ({ open, onOpenChange, commentCount }: CommentSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl bg-neutral-900 border-neutral-800 p-0">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-neutral-800">
          <SheetTitle className="text-white text-center text-sm font-semibold">
            {commentCount} Comments
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ maxHeight: 'calc(60vh - 120px)' }}>
          {mockComments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <img src={c.avatar} alt={c.user} className="w-9 h-9 rounded-full object-cover shrink-0" />
              <div>
                <p className="text-white/60 text-xs font-semibold">
                  {c.user} <span className="text-white/30 font-normal ml-1">{c.time}</span>
                </p>
                <p className="text-white text-sm mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-neutral-800 bg-neutral-900 flex gap-2">
          <Input
            placeholder="Add a comment..."
            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-white/40 text-sm rounded-full"
          />
          <Button size="icon" variant="ghost" className="shrink-0 text-primary hover:text-primary">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommentSheet;
