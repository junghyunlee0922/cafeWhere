import { HeaderBar, TabBar } from '@/components/atoms';
import CafeListItem from '@/components/organisms/CafeListItem/CafeListItem';
import { useCafeListStore, useRegionStore } from '@/store';
import pb from '@/utils/pocketbase';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CafeListPage() {
  const { region } = useRegionStore();
  const { cafeList, setCafeList } = useCafeListStore();
  const params = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const resultList = await pb.collection('cafe').getList(1, 50, {
        filter: `category~'${params.keyword}' && address~'${region}'`,
      });
      setCafeList(resultList.items);
    };
    fetchData();
  }, []);

  return (
    <>
      <HeaderBar name={'카페리스트'} />
      <div className="flex h-svh flex-col gap-3">
        {cafeList?.map((item) => (
          <CafeListItem data={item} />
        ))}
      </div>
      <TabBar />
    </>
  );
}

export default CafeListPage;
