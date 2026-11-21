/** 서양 점성술(상승궁·하우스) 근사 계산용 출생지 목록 */

export const DEFAULT_BIRTH_PLACE_ID = "seoul";

export const BIRTH_PLACES = [
  { id: "seoul", name: "서울", lat: 37.5665, lng: 126.978, tz: 9 },
  { id: "busan", name: "부산", lat: 35.1796, lng: 129.0756, tz: 9 },
  { id: "daegu", name: "대구", lat: 35.8714, lng: 128.6014, tz: 9 },
  { id: "incheon", name: "인천", lat: 37.4563, lng: 126.7052, tz: 9 },
  { id: "gwangju", name: "광주", lat: 35.1595, lng: 126.8526, tz: 9 },
  { id: "daejeon", name: "대전", lat: 36.3504, lng: 127.3845, tz: 9 },
  { id: "ulsan", name: "울산", lat: 35.5384, lng: 129.3114, tz: 9 },
  { id: "suwon", name: "수원", lat: 37.2636, lng: 127.0286, tz: 9 },
  { id: "jeju", name: "제주", lat: 33.4996, lng: 126.5312, tz: 9 },
  { id: "chuncheon", name: "춘천", lat: 37.8813, lng: 127.73, tz: 9 },
  { id: "gangneung", name: "강릉", lat: 37.7519, lng: 128.8761, tz: 9 },
  { id: "cheongju", name: "청주", lat: 36.6424, lng: 127.489, tz: 9 },
  { id: "jeonju", name: "전주", lat: 35.8242, lng: 127.148, tz: 9 },
  { id: "changwon", name: "창원", lat: 35.228, lng: 128.6811, tz: 9 },
  { id: "tokyo", name: "도쿄(해외)", lat: 35.6762, lng: 139.6503, tz: 9 },
  { id: "beijing", name: "베이징(해외)", lat: 39.9042, lng: 116.4074, tz: 8 },
  { id: "la", name: "로스앤젤레스(해외)", lat: 34.0522, lng: -118.2437, tz: -8 },
  { id: "nyc", name: "뉴욕(해외)", lat: 40.7128, lng: -74.006, tz: -5 },
];

export function resolveBirthPlace(placeId) {
  const assumed = !placeId;
  const id = placeId || DEFAULT_BIRTH_PLACE_ID;
  const place = BIRTH_PLACES.find((item) => item.id === id) || BIRTH_PLACES[0];
  return {
    ...place,
    assumed,
    label: assumed ? `${place.name}(기본·미선택)` : place.name,
  };
}
