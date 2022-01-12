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
// Глобальная переменная
let fileString = '';
// Функции
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
        console.log(reader.result);
        addInputRow('url', reader.result);
        $(evt.currentTarget).parent().detach();
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}
// События
$('#add-url-field').click(function () { addInputRow('url'); });
$('#add-file-field').click(function () { addInputRow('file'); });

$('#generate').click(async function (evt) {
    // Получить количество снежинок
    let snowflakesLimit = $('#images-count').val()*1;
    if(snowflakesLimit < 1) alert('!!!');
    // Получить текстовое представление массива
    let snowflakesArr_str = '';
    $('.url-field').each(function (idx, el) {
        console.log($(el).val());
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
    console.log(file_str);
    $('#previewIFrame').attr('srcdoc', file_str);
    fileString = file_str;
    $('#downloadButton').removeAttr('disabled');
});
$('#downloadButton').click(function (evt) {
    if(fileString.length > 0)
        download('falling_images.html', fileString);
});
