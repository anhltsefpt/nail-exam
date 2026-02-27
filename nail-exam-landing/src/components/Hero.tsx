import { useTranslations } from 'next-intl';
import Image from 'next/image';


export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative overflow-hidden mt-6 pb-20">
            {/* Background gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-canvas">
                <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-rose-light/50 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-info-bg/40 blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">

                    <div className="flex-1 text-center md:text-left pt-10">
                        <h1 className="text-[3rem] md:text-6xl lg:text-[4.5rem] font-bold tracking-tight text-ink mb-6 leading-tight">
                            {t('title')} <br className="hidden md:block" />
                            <span className="text-rose">{t('titleHighlight')}</span>
                        </h1>
                        <p className="text-xl text-body mb-10 max-w-xl mx-auto md:mx-0">
                            {t('subtitle')}
                        </p>
                    </div>

                    <div className="flex-1 relative mt-16 md:mt-0 flex justify-center hidden md:flex">
                        {/* Phone frame with real app screenshot */}
                        <div className="relative w-72 h-[550px] rounded-[3rem] border-[8px] border-ink shadow-2xl z-10 overflow-hidden bg-ink">
                            <Image
                                src="/question.png"
                                alt="NailPrep practice question screen"
                                fill
                                className="object-cover object-top"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
