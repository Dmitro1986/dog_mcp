// Добавьте эту функцию в начало файла
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('resetInputs').addEventListener('click', function() {
        document.getElementById('linksLimit').value = '10';
        document.getElementById('imagesLimit').value = '10';
        document.getElementById('headingsLimit').value = '10';
        document.getElementById('urlInput').value = '';
        document.getElementById('dataType').value = 'all';
        document.getElementById('result').innerHTML = '';
    });
    
    // Добавляем обработчик для кнопки очистки URL
    document.getElementById('clearUrl').addEventListener('click', function() {
        document.getElementById('urlInput').value = '';
        document.getElementById('urlInput').focus();
    });
});
async function startScraping() {
    const urlInput = document.getElementById('urlInput');
    const linksLimit = document.getElementById('linksLimit');
    const imagesLimit = document.getElementById('imagesLimit');
    const headingsLimit = document.getElementById('headingsLimit');
    const dataType = document.getElementById('dataType');
    const resultDiv = document.getElementById('result');
    const url = urlInput.value;

    if (!url) {
        resultDiv.innerHTML = '<p class="text-red-500">Пожалуйста, введите URL</p>';
        return;
    }

    try {
        resultDiv.innerHTML = '<p class="text-gray-500">Загрузка...</p>';
        
        const response = await fetch('/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                limits: {
                    links: parseInt(linksLimit.value) || 10,
                    images: parseInt(imagesLimit.value) || 10,
                    headings: parseInt(headingsLimit.value) || 10
                },
                dataType: dataType.value
            })
        });

        const data = await response.json();
        console.log(data);// +++
        if (data.status === 'error') {
            throw new Error(data.message);
        }

        // Красивый вывод JSON
        resultDiv.innerHTML = `<pre class="text-xs bg-gray-100 p-4 rounded overflow-x-auto">${JSON.stringify(data, null, 2)}</pre>`;

        // Если нужно вернуть обратно красивый HTML-вывод, просто закомментируйте строку выше и раскомментируйте старый код.
        // Форматируем результаты в зависимости от выбранного типа данных
        let html = '<div class="space-y-4">';

        if (dataType.value === 'all' || dataType.value === 'metadata') {
            html += `
                <div class="border-b pb-4">
                    <h2 class="text-xl font-bold mb-2">Метаданные</h2>
                    <p><strong>Заголовок:</strong> ${data.data.metadata.title || 'Не найден'}</p>
                    <p><strong>Описание:</strong> ${data.data.metadata.description || 'Не найдено'}</p>
                    <p><strong>Ключевые слова:</strong> ${data.data.metadata.keywords || 'Не найдены'}</p>
                </div>`;
        }

        if (dataType.value === 'all' || dataType.value === 'headings') {
            html += `
                <div class="border-b pb-4">
                    <h2 class="text-xl font-bold mb-2">Заголовки</h2>
                    <p><strong>H1:</strong> ${data.data.headers.h1.join(' | ') || 'Не найдены'}</p>
                    <p><strong>H2:</strong> ${data.data.headers.h2.join(' | ') || 'Не найдены'}</p>
                    <p><strong>H3:</strong> ${data.data.headers.h3.join(' | ') || 'Не найдены'}</p>
                </div>`;
        }

        if (dataType.value === 'all' || dataType.value === 'links') {
            html += `
                <div class="border-b pb-4">
                    <h2 class="text-xl font-bold mb-2">Ссылки</h2>
                    <ul class="list-disc pl-5">
                        ${data.data.links.map(link => `
                            <li><a href="${link.href}" target="_blank" class="text-blue-500 hover:underline">${link.text || link.href}</a></li>
                        `).join('')}
                    </ul>
                </div>`;
        }

        if (dataType.value === 'all' || dataType.value === 'images') {
            html += `
                <div>
                    <h2 class="text-xl font-bold mb-2">Изображения</h2>
                    <div class="grid grid-cols-2 gap-4">
                        ${data.data.images.map(img => {
                            const imgSrc = new URL(img.src, data.url).href;
                            return `
                                <div class="border p-2">
                                    <p class="text-sm mb-1">${img.alt || 'Без описания'}</p>
                                    <img src="${imgSrc}" alt="${img.alt || 'Image'}" class="max-w-full h-auto" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23eee%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22>404</text></svg>';">
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>`;
        }

        html += '</div>';
        resultDiv.innerHTML = html;

    } catch (error) {
        resultDiv.innerHTML = `<p class="text-red-500">Ошибка: ${error.message}</p>`;
    }
}
