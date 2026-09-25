import CouponForm from '../../../../../components/CouponForm';

export default async function EditCouponPage({ params }) {
  const { id } = await params;
  return <CouponForm id={id} />;
}
