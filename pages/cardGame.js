import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import styles from "./cardGame.module.scss";
import cover from "../static/OnePiece/OnePieceCover.jpeg";
import { server } from "../config";

/** 快速排序法
 * https://medium.com/schaoss-blog/%E5%89%8D%E7%AB%AF%E4%B8%89%E5%8D%81-06-js-%E8%AB%8B%E4%BD%A0%E5%9C%A8%E6%97%81%E9%82%8A%E7%9A%84%E7%99%BD%E6%9D%BF%E5%AF%AB%E5%80%8B%E5%BF%AB%E9%80%9F%E6%8E%92%E5%BA%8F%E6%BC%94%E7%AE%97%E6%B3%95-8d8ad4903b1c
 */
function quickSort(arr) {
  if (arr.length < 2) return arr;
  const [p, ...ary] = arr;
  const left = [],
    right = [];

  ary.forEach((c) => {
    if (c < p) left.push(c);
    else right.push(c);
  });
  return [...quickSort(left), p, ...quickSort(right)];
}

// const test = quickSort([48, 44, 22, 99, 77, 32]);

const Cards = ({ data }) => {
  const [cardsData, setCardsData] = useState(data);
  const [selectData, setSelectData] = useState([]);

  const clickCardStyle = styles.clickCard;
  const ref = useRef(null);

  const clickCard = (data) => {
    ref.current = data.target.parentElements;
    const { cardIndex, value } = data.target.dataset;

    const cardData = cardsData[parseInt(cardIndex)];
    cardData.isOpen = true;
    /** setCardsData不可以使用直接放cardsData，要[...cardsData] */
    setCardsData([...cardsData]);

    selectData.push(value);
    setSelectData(selectData);
  };

  const card = (data, index) => {
    const handleTransitionEnd = (e) => {
      if (data.isOpen && selectData.length === 2) {
        /** 1. 先filter isOpen = true
         *  2. 是否match ? isMatch的style: isOpen的style */
        const isMatchCards = selectData[0] === selectData[1];
        let setNewCardsData = Object.assign([], cardsData);

        setNewCardsData.map((item) => {
          if (item.isOpen) {
            isMatchCards ? (item.isMatch = true) : (item.isOpen = false);
          }
        });
        setCardsData(setNewCardsData);
        setSelectData([]);
      }
    };
    return (
      <div
        key={index}
        className={`${styles.card} ${data.isOpen ? clickCardStyle : ""}`}
        onClick={(e) =>
          data.isOpen || selectData.length === 2 ? () => {} : clickCard(e)
        }
        onTransitionEnd={(e) => handleTransitionEnd(e)}
      >
        <div
          className={styles.front}
          data-value={data.value}
          data-card-index={index}
        />
        <div className={styles.back}>
          <Image
            src={`/static/OnePiece/${data.filename}`}
            alt={data.filename}
            layout="responsive"
            width={2}
            height={3}
          />
        </div>
      </div>
    );
  };
  // return card(data[0]);
  return cardsData.map((item, index) => card(item, index));
};

function cardGame({ data }) {
  return (
    <div className={styles.container}>
      <Cards data={data} />
    </div>
  );
}

export async function getServerSideProps() {
  // Fetch data from external API
  // const res = await fetch(`https://.../data`);
  const res = await fetch(`${server}/api/filenames`);
  const filenames = await res.json();
  filenames.sort(() => 0.5 - Math.random());
  const newFilenames = filenames.slice(0, 3);
  let data = newFilenames.map((filename, index) => {
    return { value: index, filename: filename, isOpen: false, isMatch: false };
  });

  let data2 = [...data, ...data];

  data2.sort(() => {
    return 0.5 - Math.random();
  });

  // Pass data to the page via props
  return { props: { data: data2 } };
}

export default cardGame;
