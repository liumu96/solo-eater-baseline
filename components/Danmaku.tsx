import React, { useState, useEffect, useRef } from "react";

interface DanmakuItem {
  id: number;
  text: string;
}

const foodMessages = [
  "😋 Feel the different textures as you chew. An adventure for taste buds",
  "😍 Each bite is a gift to your senses. ",
  "🍛 What lovely ingredients! Notice each one as you eat ",
  "💃 Enjoy the dance of flavors in your mouth ",
  "👀 Admire the look of your food before taking a bite. A feast for your eyes ",
  '💁‍♂️ "To eat is a necessity, but to eat intelligently is an art." – François de La Rochefoucauld',
  "🥄 Enjoy every bite",
  "👃 Smell that? Your food is calling you to enjoy it ",
  '💁‍♂️ "There is no sincerer love than the love of food." – George Bernard Shaw ',
  "🏖️  Every bite is a new adventure. Relish the journey ",
  "🎼  Enjoy the rhythm of your meal ",
  '💁‍♀️ "Food for the body is not enough. There must be food for the soul." – Dorothy Day',
  "🎉  Discover the hidden treasures in your food.",
  "🌈  So many tasty ingredients. A rainbow of deliciousness",
  '💁‍♂️ "Good food is the foundation of genuine happiness." – Auguste Escoffier ',
  "💡 Discover the subtle flavors in each bite. ",
  "😌 Your meal smells wonderful! Let the aromas soothe you",
];

const Danmaku: React.FC = () => {
  const [danmakuList, setDanmakuList] = useState<DanmakuItem[]>([]);
  const messageIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 添加新的弹幕并设置下一次的时间间隔
  const addDanmaku = () => {
    const text = foodMessages[messageIndexRef.current];
    setDanmakuList((prevList) => [...prevList, { id: Math.random(), text }]);
    messageIndexRef.current =
      (messageIndexRef.current + 1) % foodMessages.length;

    const getRandomInterval = () => {
      return Math.floor(Math.random() * (4000 - 3000 + 1)) + 3000;
    };
    timerRef.current = setTimeout(addDanmaku, getRandomInterval());
  };

  useEffect(() => {
    addDanmaku();
  }, []);

  // 清理超过一定数量的弹幕
  useEffect(() => {
    if (danmakuList.length > 15) {
      setDanmakuList((prevList) => prevList.slice(-15));
    }
  }, [danmakuList]);

  return (
    <div className="danmaku-container">
      {danmakuList.map((danmaku) => (
        <div key={danmaku.id} className="danmaku-item">
          {danmaku.text}
        </div>
      ))}
    </div>
  );
};

export default Danmaku;
