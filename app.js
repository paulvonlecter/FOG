// Константы
// Стили
const HEAD_STYLE = `html, body { padding: 0; margin: 0; width: 100vw; height: 100vh; position: relative; overflow: hidden; }
.snowflake { --size: 1vh; width: var(--size); height: var(--size); background-size: contain; background-repeat: no-repeat; background-position: center; position: absolute; top: -5vh; }
@keyframes snowfall {
    0% { transform: translate3d(var(--left-ini), 0, 0); }
    100% { transform: translate3d(var(--left-end), 110vh, 0); }
}
.snowflake:nth-child(6n) { filter: blur(1px); }`;
// Функции
const JS_FUNCS = `function rand(min, max) { min = Math.ceil(min); max = Math.floor(max); return Math.floor(Math.random() * (max - min + 1) + min); }
function spawnSnowflakes() {
    let back = snowflakesArr[rand(0, snowflakesArr.length - 1)];
    let snowflakeElement = document.createElement('div');
    snowflakeElement.setAttribute('class', 'snowflake');
    snowflakeElement.setAttribute('style', '--size:'+(rand(0,5)*0.2*3)+'vw; --left-ini:'+(rand(0,20)-10)+'vw; --left-end:'+(rand(0,20)-10)+'vw; left:'+rand(0, 100)+'vw; animation:snowfall '+(5+rand(0,10))+'s linear infinite; animation-delay:-'+rand(0, 10)+'s; background-image:url("'+snowflakesArr[rand(0, snowflakesArr.length - 1)]+'")');
    document.body.prepend(snowflakeElement);
}
window.onload = function () {
    for (var i = 0; i < LIMIT; i++) {
        spawnSnowflakes();
    }
};`;
// Функции
// Доступность хранилища
function storageAvailable(type) {
	try {
		var storage = window[type], x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) { console.error(e); return false; }
}
// Удаление строки
function deleteRow(evt) {
    $(evt.currentTarget).parent().parent().detach();
}
// Скачивание файла
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
// Добавление поля для ввода
function addInputRow(type, val) {
    let $inputGroup = $('<div>')
        .attr('class', 'input-group mb-3')
        .prependTo('#fields-collection');
    let $inputGroupAppend = $('<div>').attr('class', 'input-group-append')
        .append(
            $('<button>')
                .attr('type', 'buttton')
                .attr('class', 'btn btn-outline-danger delete-row-button')
                .append(
                    $('<i>').attr('class', 'fa fa-trash')
                )
        );
    $inputGroupAppend.appendTo($inputGroup);
    // Прицепить обработчик
    $('.delete-row-button').click(deleteRow);
    // Если требуется прикрепить файл...
    if (type === 'file') {
        let $inputFile = $('<input>')
            .attr('type', 'file')
            .attr('class', 'form-control p-1 file-field')
            .prop('required', true);
        $inputFile.prependTo($inputGroup);
        $inputFile.on('change', filechanged);
    } else {
        let $inputURL = $('<input>')
            .attr('type', 'url')
            .attr('class', 'form-control url-field')
            .attr('placeholder', 'Вставьте прямую ссылку на изображение: https://cdn.discordapp.com/attachments/76746327...123123123/icon.png')
            .prop('required', true);
        $inputURL.prependTo($inputGroup);
        if(val != undefined) {
            $inputURL.val(val);
        }
    }
}
// Добавление dataURI-поля
function filechanged(evt) {
    var reader = new FileReader();
    reader.readAsDataURL(evt.currentTarget.files[0]);
    reader.onload = function () {
        //console.log(reader.result);
        addInputRow('url', reader.result);
        $(evt.currentTarget).parent().detach();
    };
    reader.onerror = function (error) {
        console.error('Error: ', error);
    };
}
// События
$(document).ready(function(){
    // Если не работает локальное хранилище, выключить кнопку сохранения
    if (!storageAvailable('localStorage'))
        $('#save-button')
            .prop('disabled', true)
            .attr('title', 'Ваш браузер не поддерживает сохранение в localStorage');
    // Если все же работает...
    else
        // Попробовать получить сохраненные данные
        if(localStorage.getItem('FOGConfig') !== null)
            // Отобразить кнопку загрузки
            $('#load-button').removeClass('d-none');
});
$('#add-url-field').click(function () { addInputRow('url'); });
$('#add-file-field').click(function () { addInputRow('file'); });
$('#generate').click(async function (evt) {
    // Получить количество снежинок
    let snowflakesLimit = $('#images-count').val()*1;
    if(snowflakesLimit < 1) alert('!!!');
    // Получить текстовое представление массива
    let snowflakesArr_str = '';
    $('.url-field').each(function (idx, el) {
        //console.log($(el).val());
        let urlValue = $(el).val();
        // Если строка не пустая, то добавить
        if(urlValue.length > 0) {
            snowflakesArr_str = snowflakesArr_str + `"${urlValue}",`;
        } else {
            // В противном случае остановить обработку
            alert('Пустая строка!');
            return false;
        }
    });
    // Добавить всё в строку для вставки в srcdoc
    let file_str = `<html><head><style>${HEAD_STYLE}</style></head><body><script>var LIMIT = ${snowflakesLimit};var snowflakesArr = [${snowflakesArr_str}];${JS_FUNCS}` + '</s' + 'cript></body></html>';
    //console.log(file_str);
    $('#previewIFrame').attr('srcdoc', file_str);
    fileString = file_str;
    $('#downloadButton').removeAttr('disabled');
});
$('#downloadButton').click(function (evt) {
    if(fileString.length > 0)
        download('falling_images.html', fileString);
});
// Сохранение формы
$('#save-button').on('click', function (evt) {
    // Определить объект конфигурации
    let mainConfig = { 'urls': [] };
    // Для каждого поля...
    $('.url-field').each(function (idx, el) {
        let value = $(el).val();
        if(value != '') mainConfig.urls.push(value);
    });
    // Исключить сохранение пустого конфига
    if (mainConfig.urls.length > 0)
        localStorage.setItem('FOGConfig', JSON.stringify(mainConfig));
});
// Загрузка конфигурации
$('#load-button').on('click', function (evt) {
    // Получить конфигурацию
    let mainConfig = JSON.parse(localStorage.getItem('FOGConfig'));
    if(mainConfig.urls.length < 1) return;
    // Очистить набор
    $('#fields-collection').html('');
    // Выполнить для каждого элемента
    mainConfig.urls.forEach((item, i) => {
        addInputRow('url', item);
    });
});
// Экспорт конфигурации
$('#export-button').on('click', function (evt) {
    if(localStorage.getItem('FOGConfig') !== null)
        download('FOGSettings.json', localStorage.getItem('FOGConfig'));
    else
        alert('Save config first!');
});
// Импорт конфигурации
$('#import-button').on('click', function (evt) {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        // getting a hold of the file reference
        var file = e.target.files[0];
        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            try {
                let testObject = JSON.parse(content)
                // Файл должен содержать нужные параметры
                if(testObject['generationMethod']!='')
                    localStorage.setItem('appConfig', content);
                else
                    throw 'Incorrect JSON';
                // Отобразить кнопку загрузки и кликнуть по ней
                $('#load-button')
                    .removeClass('d-none')
                    .click();
            } catch (e) {
                alert(e);
            }
        }
    }
    input.click();
});
