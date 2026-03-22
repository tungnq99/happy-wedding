import { InvitationPage } from "@/app/components/invitation-page";

const demoData = {
  id: "demo-wedding",
  title: "Lễ thành hôn Đức & Trang",
  groomName: "Đức Trọng",
  brideName: "Lan Trang",
  eventDate: new Date("2026-11-28T10:30:00+07:00"),
  heroSubtitle: "Trân trọng kính mời",
  story:
    "Từ lần đầu gặp nhau ở giảng đường đại học, tụi mình đã đi cùng nhau qua rất nhiều dấu mốc.\nBọn mình mong được gặp bạn trong ngày vui này để cùng lưu lại một kỷ niệm thật đẹp.",
  coverImageUrl: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1600&q=80",
  theme: {
    primaryColor: "#8b3a3a",
    secondaryColor: "#fff7f2",
    accentColor: "#2a1d1a",
  },
  events: [
    {
      id: "demo-event-1",
      name: "Lễ cưới",
      startsAt: new Date("2026-11-28T10:30:00+07:00"),
      venueName: "Trung tâm Hội nghị White Palace",
      address: "194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP.HCM",
      mapsUrl: "https://maps.google.com",
    },
    {
      id: "demo-event-2",
      name: "Tiệc mừng",
      startsAt: new Date("2026-11-28T18:00:00+07:00"),
      venueName: "Riverside Palace",
      address: "360D Bến Vân Đồn, Phường 1, Quận 4, TP.HCM",
      mapsUrl: "https://maps.google.com",
    },
  ],
  stories: [
    {
      id: "s1",
      dateText: "Tháng 05/2019",
      title: "Ngày đầu gặp gỡ",
      content: "Những bước chân đầu tiên trên hành trình dài. Mọi thứ bắt đầu bằng một nụ cười...",
      imageUrl: null,
    },
    {
      id: "s2",
      dateText: "Năm 2022",
      title: "Những chuyến đi",
      content: "Cùng nhau khám phá những vùng đất mới, gom nhặt vô số kỷ niệm đáng nhớ.",
      imageUrl: null,
    },
    {
      id: "s3",
      dateText: "Ngày chung đôi",
      title: "Cái kết viên mãn",
      content: "Ngày mà hai ta chính thức thuộc về nhau, mở ra chương mới rạng rỡ của cuộc đời.",
      imageUrl: null,
    },
  ],
  media: [
    { id: "m1", url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=900&q=80" },
    { id: "m2", url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80" },
    { id: "m3", url: "https://images.unsplash.com/photo-1465495976277-4387d4b0d799?auto=format&fit=crop&w=900&q=80" },
    { id: "m4", url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80" },
    { id: "m5", url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&w=900&q=80" },
    { id: "m6", url: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80" },
  ],
  wishes: [
    { id: "w1", guestName: "Thúy Linh", content: "Chúc hai bạn trăm năm hạnh phúc, luôn yêu thương nhau thật nhiều." },
    { id: "w2", guestName: "Minh Khoa", content: "Chúc mừng hạnh phúc, gia đình nhỏ lúc nào cũng đầy tiếng cười nhé." },
    { id: "w3", guestName: "Ngọc Anh", content: "Hẹn gặp trong ngày vui. Chúc hai bạn một chặng đường thật đẹp." },
    { id: "w4", guestName: "Anh Tú", content: "Mãi mãi hạnh phúc và bình an. Chúc mừng cô dâu chú rể." },
  ],
};

export default function DemoLandingPage() {
  return <InvitationPage data={demoData} isDemo />;
}

