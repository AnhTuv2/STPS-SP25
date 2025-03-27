import Dulich from "../assets/img/DULICH.png";

export default function Banner() {
  return (
    <section className="w-full">
      <div
        className="w-full h-[300px] md:h-[360px] bg-cover bg-[center_top] rounded-b-2xl"
        style={{
          backgroundImage: `url(${Dulich})`,
        }}
      >
        {/* Không cần overlay chữ nữa vì ảnh đã có sẵn */}
      </div>
    </section>
  );
}