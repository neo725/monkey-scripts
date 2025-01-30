// ==UserScript==
// @name         YTS info wrapper
// @namespace    https://github.com/neo725/monkey-scripts
// @version      2024-11-17
// @description  Extract ratings and categories and display them more clearly, and link movie information to TMDB.
// @author       Neo
// @match        https://yts.mx/*
// @match        https://yts.mx/browse-movies/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=yts.mx
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const addJquery = (callback) => {
        var script = document.createElement("script");
        script.setAttribute("src", "//cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js");
        script.addEventListener('load', function() {
            var script = document.createElement("script");
            script.textContent = "window.jQ = jQuery.noConflict(true);(" + callback.toString() + ")();";
            document.body.appendChild(script);
        }, false);
        document.body.appendChild(script);
    };

    const _main_ = function () {
        const category_i18nMap = [
            { 'Action': '動作' },
            { 'Comedy': '喜劇' },
            { 'Drama':  '劇情' },
            { 'Romance': '浪漫' },
            { 'Crime': '犯罪' },
            { 'Adventure': '冒險' },
            { 'Biography': '傳記' },
            { 'Horror': '恐怖' },
            { 'Family': '家庭' },
            { 'Thriller': '驚悚' },
            { 'Animation': '動畫' },
            { 'Sci-Fi': '科幻' },
            { 'Documentary': '紀錄片' },
            { 'History': '歷史' },
            { 'Fantasy': '奇幻' },
            { 'Musical': '音樂劇' },
            { 'Music': '音樂' },
        ];
        const _tmdbUrl = 'https://www.themoviedb.org/search?query=';
        const __main_ = ($) => {
            const selector = {
                movie: '.browse-content .browse-movie-wrap',
                category: 'a.browse-movie-link figure figcaption h4',
                title: '.browse-movie-bottom .browse-movie-title',
                year: '.browse-movie-bottom .browse-movie-year',
            };
            const infoStyles = [
                'background: rgba(255, 255, 255, .8)',
                'position: absolute',
                'display: inline-block',
                'width: 165px',
                'top: 0px;',
                'left: 0px',
                'padding: 5px',
                'font-size: 1em',
                'color: #1d58e1 !important;',
                'font-weight: 700',
                'z-index: 999',
            ];
            const createPanel = () => {
                const div = document.createElement('div');
                $(div)
                    .attr('class', 'info-panel');
                    //.attr('style', infoStyles.join(';'));
                return div;
            };
            const createLink = (href) => {
                const a = document.createElement('a');
                $(a)
                    .attr('style', infoStyles.join(';'))
                    .attr('href', href)
                    .attr('class', 'info-title')
                    .attr('target', '_blank');
                return a;
            }
            const getCategoryTextMap = (category) => {
                const result = category_i18nMap.find(item => item[category]);

                // 取出對應的值
                const translation = result ? result[category] : null;
                if (translation == null) {
                    if (category !== undefined && category != null) {
                        return category;
                    }
                }

                return translation;
            };
            const parseMoviesInfo = (movies) => {
                $(movies).each((index, movie) => {
                    const $movie = $(movie);
                    const $categories = $movie.find(selector.category);
                    // 評分
                    const $rating = $($categories[0]);
                    // 主分類
                    const $category = $($categories[1]);
                    const categoryText = {
                        'text': getCategoryTextMap($category.text())
                    };
                    // 次分類
                    const subcategory = { 'text': null };
                    if ($categories.length > 2) {
                        subcategory.text = $($categories[2]).text();
                        const subCategoryText = getCategoryTextMap(subcategory.text);
                        if (subCategoryText != null) {
                            categoryText.text += ' ' + subCategoryText;
                        }
                    }
                    // 每一部電影的 div
                    const $div = $category.parent().parent().parent();
                    // 自訂電影快顯資訊
                    const $panel = $(createPanel());
                    const $title = $($movie.find(selector.title)[0]);
                    const ratingText = $rating.text();
                    const matches = ratingText.match(/[\d.]+/g); // 使用正則表達式匹配所有數字
                    const ratingData = {
                        rate: 0,
                        total: 10
                    };
                    if (matches) {
                        const rating = parseFloat(matches[0]); // 取得第一個數值 5.5
                        const total = parseFloat(matches[1]); // 取得第二個數值 10
                        ratingData.rate = rating;
                        ratingData.total = total;
                    }
                    // display: {category} - {rating} or just {category}
                    $panel.text(ratingData.rate > 0 ? `${categoryText.text} - ${ratingData.rate}` : categoryText.text);

                    // link to TMDB by title
                    const $a = $(createLink(`${_tmdbUrl}${encodeURIComponent($title.text())}`));

                    // if rating is higher than 5.5, mark it as high
                    if (ratingData.rate > 5.5) {
                        $a.addClass('high');
                        $a.css('color', '#e11d2f');
                    }
                    
                    $a.append($panel);
                    $movie.append($a);
                });
            };
            $(document).ready(function() {
                const movies = $(selector.movie);
                parseMoviesInfo(movies);
                const style = document.createElement('style');
style.textContent = `
  .info-title a {
    color: #1d58e1 !important;
    font-size: 1em;
    font-weight: 700;
  }
  .info-title.high a {
    color: #e11d2f !important;
  }
`;
                document.body.appendChild(style);
            });
        };


        const waitjQuery = () => {
            if (window.jQ) {
                __main_(window.jQ);
                return;
            }
            setTimeout(waitjQuery, 1000);
        };
        setTimeout(waitjQuery, 1000);

    };

    addJquery(_main_);
})();