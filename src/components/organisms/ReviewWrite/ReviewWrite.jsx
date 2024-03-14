import RatingScore from '@/components/atoms/RatingScore/RatingScore';
import { useCafeStore, useHashtagStore } from '@/store';
import pb from '@/utils/pocketbase';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ReviewWrite() {
  const reviewRef = useRef(null);
  const [rating, setRating] = useState(1);
  const userId = JSON.parse(localStorage.getItem('pocketbase_auth')).model.id;
  const [reviewText, setReviewText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const { hashtag, resetHashtag } = useHashtagStore();
  const params = useParams();
  const { cafe } = useCafeStore();
  const navigate = useNavigate();
  const handleReviewCheck = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('cafeName', cafe.cafeName);
    formData.append('users', userId);
    formData.append('contents', reviewText);
    formData.append('score', rating);

    hashtag.forEach((tag) => {
      formData.append('hashtag', tag);
    });

    // const data = Object.fromEntries(formData.entries());

    await pb
      .collection('review')
      .create(formData)
      .then(async () => {
        alert('전송 완료');
        navigate(`/detail/${params.id}`);

        const data = {
          ...cafe,
          score: (cafe.score + rating) / cafe.reviewQuantity + 1,
          reviewQuantity: cafe.reviewQuantity + 1,
          hashtag: [...cafe.hashtag, ...hashtag],
        };
        resetHashtag();

        await pb.collection('cafe').update(params.id, data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    const thumbnail = URL.createObjectURL(file);

    setImagePreview(thumbnail);
  };

  return (
    <div className="h-full min-h-svh">
      <form
        onSubmit={handleReviewCheck}
        className="flex flex-col items-center gap-4 rounded-lg bg-white py-4"
        encType="multipart/form-data"
      >
        <span className="text-lg font-semibold">리뷰 쓰기</span>
        <RatingScore rating={rating} setRating={setRating} />
        <textarea
          placeholder="리뷰를 남겨주세요"
          ref={reviewRef}
          className="h-300pxr w-300pxr overflow-auto rounded-md bg-slate-100"
          onChange={(e) => setReviewText(e.target.value)}
        ></textarea>

        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="*.jpg,*.png,*.jpeg,*.webp,*.avif,*.svg"
            multiple
            id="photos"
            name="image"
            onChange={handleImageChange}
          />

          {imagePreview && <img src={imagePreview} alt="테스트 이미지" />}
        </div>

        <button
          type="submit"
          className="w-300pxr rounded-md bg-black py-4 text-white"
        >
          작성하기
        </button>
      </form>
    </div>
  );
}

export default ReviewWrite;
