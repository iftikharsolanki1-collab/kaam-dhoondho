import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, AlertTriangle, Users, Eye, Ban } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SafetyCenterProps {
  language: 'en' | 'hi';
  onBack: () => void;
}

const SafetyCenter = ({ language, onBack }: SafetyCenterProps) => {
  const content = {
    en: {
      title: 'Safety Center',
      subtitle: 'Our community guidelines and safety policies',
      sections: [
        {
          icon: <Shield className="w-5 h-5 text-primary" />,
          title: 'Content Review Policy',
          items: [
            'Every new post goes through automated quality checks before being visible.',
            'Posts with suspicious keywords in the description may be flagged for manual review.',
            'Our moderation team reviews flagged content within 24 hours.',
          ],
        },
        {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          title: 'Strike System',
          items: [
            '1st Strike: Post removed + 3-day posting ban.',
            '2nd Strike: Post removed + 7-day posting ban.',
            '3rd Strike: Permanent account deletion.',
            'Strikes are issued after admin review of reported content.',
          ],
        },
        {
          icon: <Users className="w-5 h-5 text-blue-500" />,
          title: 'Community Reporting',
          items: [
            'Any user can report a post they find suspicious, fake, or inappropriate.',
            'If 5 or more unique users report the same post, it is automatically hidden.',
            'Hidden posts remain hidden until an admin manually approves them.',
            'False or abusive reporting may result in action against the reporter.',
          ],
        },
        {
          icon: <Ban className="w-5 h-5 text-destructive" />,
          title: 'Prohibited Content',
          items: [
            'Fake job listings or fraudulent services.',
            'Content with hate speech, discrimination, or threats.',
            'Spam or duplicate postings.',
            'Misleading contact information or scam phone numbers.',
            'Any content that violates Indian law.',
          ],
        },
      ],
      reportTip: 'See something wrong? Use the "Report" button on any post to notify our team.',
    },
    hi: {
      title: 'सुरक्षा केंद्र',
      subtitle: 'हमारे समुदाय दिशा-निर्देश और सुरक्षा नीतियां',
      sections: [
        {
          icon: <Shield className="w-5 h-5 text-primary" />,
          title: 'कंटेंट समीक्षा नीति',
          items: [
            'हर नई पोस्ट दिखने से पहले स्वचालित गुणवत्ता जांच से गुजरती है।',
            'संदिग्ध कीवर्ड वाली पोस्ट मैन्युअल समीक्षा के लिए फ़्लैग हो सकती है।',
            'हमारी मॉडरेशन टीम 24 घंटे के भीतर फ़्लैग की गई सामग्री की समीक्षा करती है।',
          ],
        },
        {
          icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
          title: 'स्ट्राइक सिस्टम',
          items: [
            'पहली स्ट्राइक: पोस्ट हटाई + 3 दिन का पोस्टिंग बैन।',
            'दूसरी स्ट्राइक: पोस्ट हटाई + 7 दिन का बैन।',
            'तीसरी स्ट्राइक: स्थायी अकाउंट डिलीट।',
            'स्ट्राइक रिपोर्ट की गई सामग्री की एडमिन समीक्षा के बाद दी जाती है।',
          ],
        },
        {
          icon: <Users className="w-5 h-5 text-blue-500" />,
          title: 'सामुदायिक रिपोर्टिंग',
          items: [
            'कोई भी यूज़र संदिग्ध, फर्जी या अनुचित पोस्ट की रिपोर्ट कर सकता है।',
            'अगर 5 या अधिक यूज़र एक ही पोस्ट रिपोर्ट करते हैं, तो वह स्वतः छिप जाती है।',
            'छिपी हुई पोस्ट तब तक छिपी रहेगी जब तक एडमिन मैन्युअल रूप से अनुमोदित नहीं करता।',
            'झूठी या दुर्भावनापूर्ण रिपोर्टिंग पर रिपोर्टर के खिलाफ कार्रवाई हो सकती है।',
          ],
        },
        {
          icon: <Ban className="w-5 h-5 text-destructive" />,
          title: 'प्रतिबंधित सामग्री',
          items: [
            'फर्जी नौकरी लिस्टिंग या धोखाधड़ी वाली सेवाएं।',
            'नफरत फैलाने वाली, भेदभावपूर्ण या धमकी भरी सामग्री।',
            'स्पैम या डुप्लिकेट पोस्टिंग।',
            'भ्रामक संपर्क जानकारी या स्कैम फोन नंबर।',
            'भारतीय कानून का उल्लंघन करने वाली कोई भी सामग्री।',
          ],
        },
      ],
      reportTip: 'कुछ गलत दिख रहा है? किसी भी पोस्ट पर "रिपोर्ट" बटन दबाकर हमारी टीम को बताएं।',
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <div className="container mx-auto px-4 py-4 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              {c.title}
            </h1>
            <p className="text-sm text-muted-foreground">{c.subtitle}</p>
          </div>
        </div>

        {/* Policy Sections */}
        <Accordion type="multiple" defaultValue={['0', '1', '2', '3']} className="space-y-3">
          {c.sections.map((section, idx) => (
            <AccordionItem key={idx} value={String(idx)} className="border rounded-xl overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <span className="font-semibold text-foreground text-left">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Report Tip */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">{c.reportTip}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyCenter;
