import React from 'react';

const ProductAPIArchitecture = () => {
    const mermaidUrl = "https://mermaid.live/view#pako:eNqVV21z4jYQ_isaf8p1QjCGGPC010kK6TFN7rgEejMtHY-CBGhiLFeWabkM__3W8pv8EiB8wVrt8-xq9_HafjWWnFDDMUKJJR0xvBZ429pZCx_B7--f_kGt1kc0IR510M10gp6o2FGBJj6TDHvsOyULP_FVBMoTvSYWneGehZL6zF876BsGrL9GKy7QI_03oqEME8Ah48q9Ffb38cxNHR30aTabxpafn8XHNg5YOxCcREsZ1gy_MvJLeu0y0kQ8_fJUZY5NNaZG7LwGnc9O5BBvv6IoIFApglaMeiSMD11nH43vx7NxJUBiPHlOvR1a6Zq68pm7k5EDf-hrRMUeTTF0n0po8FTwHSOU1DHfmNwo1GR0Bqq4UrEUwyOVkfDdG89z0B2Vyw3CPkmtCKwxjVb3-JcGTSqfnvWORz4BBgbg1Iae95DWcdhnnkMzFHiAFSlrVr_4V4qUph4G3A-pa5mmk64I-g_C5GQjKjHzQnQBLujLHx_qdHkGZcqe2atQjoWAe-QCNor8NL6ijqdy04taSexQFox-SzQpBnoNEW452TvJdXYLo9imnTX3U7AnELZH3TQHJ13nNavrpoK_jbyXDB06alkcqEAX-HJAxfEnzKv4zsuMhXOJ_Q3fwru6VwCK8-ViwBIneyfwE393hCHdrWVRorghGhwWGcVF-AFJDhytB7rlcL_eCIG1VlVCJ_16YYHWLVhlbhqrno4WXBMjAS12qlok0KqSGjvoN0HjkahpW0-gStgs3PkZup2MXBg1JflqMyCZQm-rWUMnPRu5mfTUNJwKGlJfngF7YGGonoWASq_1YmrE9YnnwkmPT7234PncSSjeNf1iiCKbB7p2nXSdk92ph1pBUnavzakkk5I-5unjMYOcMUfz5PRZ2kB9Yp4WjamSmcfITHSLc-E0T9Xy4_yYPhtkuRJ8i-aP93VdVVXoQpzjSqwIMAccF2Hs1iBEBT5TiDWKonmK5n1izMgeYaDtNDEm65xMVa4y7cqQuiBVNqVGj6hH3yvIIkFNkHXqswXZRGgeI3xDlMalsaViixmBV34lw4UhN3RLF4YDlwSLl4Wx8A_ghyPJn_b-0nCkiOilIXi03hjOCnshrJKX2PR7IXMJsP8X5_rScF6N_w2nZdnWlTUYdOyh3Te7ttXrXRp7w7FMMFt2dzjs94eDa9MaHC6N74qic3Vtmn2w9LvdzsDu2f0s6JgwyUWeiccxoSIOJPdB_CWzhjdpyH_J_RVbx_ZIeGDeSBmETrsdb1-toVjR89WSb9shIxss5GY3tNu2ZQ-w1aV2v4uvu12yfO4MByur11mRvtmxsHGA_KiK_5B8Nqmvp8MPD8M3Rg";

    return (
        <div className="flex h-screen">
            <iframe
                src={mermaidUrl}
                width="100%"
                height="90%"
                frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default ProductAPIArchitecture;