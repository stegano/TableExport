function TableExport(element, options) {

    if (!(this instanceof TableExport)) {
        // new 생성자를 사용하여 생성하도록 강제한다.
        throw "new 생성자를 이용해 주세요 :(";
    }

    if (!(element instanceof HTMLTableElement)) {

        throw "인자 값으로 입력되는 엘리먼트는 테이블 엘리먼트이어야만 합니다 :("
    }

    var table = {
        rows: [],
        metadata: []
    };

    // `options`에 들어간 기본 값을 생성한다.
    options = !options ? {mergeCell: {}} : options;
    options.mergeCell.fill = !options.mergeCell.fill ? true : options.mergeCell.fill;

    // 테이블 생성
    for (var i = 0, tr, trs = element.children, ilen = trs.length; tr = trs[i], i < ilen; i++) {
        // `tr`
        if (tr instanceof HTMLTableRowElement && tr.childElementCount > 0) {

            for (var k = 0, cSize = 0, cell, cells = tr.children, klen = cells.length; cell = cells[k], k < klen; k++) {

                if (k === 0) {
                    // 테이블의 컬럼 갯수를 센다.
                    for (var j = 0, colspan; j < klen; j++) {

                        if (colspan = Number(cell.getAttribute('colspan')) > 0) {
                            cSize += colspan;
                        } else {
                            cSize++
                        }
                    }
                }
                // `th`, `td`
                if (cell instanceof HTMLTableCellElement) {

                    // 셀에 데이터가 존재하지 않는 경우 데이터를 입력한다. -- `colspan`, `rowspan`으로 인해 값이 미리 입력되는 경우를 제외한 모든 경우.
                    var ctext = cell.innerText;

                    if (!table.rows[i]) {
                        // `Row`가 존재하지 않을경우 생성
                        table.rows[i] = [];
                        table.metadata[i] = [];
                    }

                    table.rows[i].push(ctext);
                    // DOM 객체에 접근하지 않기 위해 미리 데이터를 생성함.
                    table.metadata[i].push({
                        colspan: Number(cell.colSpan),
                        rowspan: Number(cell.rowSpan)
                    });
                }
            }
        }
    }

    // `colspan`, `rowspan` 데이터를 이용하여 빈 공간을 채움.
    for (var i = 0; i < table.metadata.length; i++) {

        for (var k = 0; k < table.metadata[i].length; k++) {

            var span = table.metadata[i][k];

            if (span.colspan > 1) {
                // `colspan` 개수만큼 셀에 데이터를 복사한다.
                var rtail = table.rows[i].splice(k + 1);
                var mtail = table.metadata[i].splice(k + 1);


                for (var j = 1; j < span.colspan; j++) {

                    table.rows[i].push(options.mergeCell.fill === true ? table.rows[i][k] : options.mergeCell.fill);
                    table.metadata[i].push({colspan: 0, rowspan: 0});
                }

                table.rows[i].push.apply(table.rows[i], rtail);
                table.metadata[i].push.apply(table.metadata[i], mtail);
            }

            if (span.rowspan > 1) {
                // `rowspan` 개수만큼 셀에 데이터를 복사한다.
                for (var j = 1; j < span.rowspan; j++) {

                    rtail = table.rows[i + j].splice(k);
                    mtail = table.metadata[i + j].splice(k);

                    table.rows[i + j].push(table.rows[i][k]);
                    table.metadata[i + j].push({colspan: 0, rowspan: 0});

                    table.rows[i + j].push.apply(table.rows[i + j], rtail);
                    table.metadata[i + j].push.apply(table.metadata[i + j], mtail);
                }
            }
        }
    }

    this.toArray = function () {
        // 데이터를 배열로 리턴한다.
        return table.rows.slice();
    };

    this.toCSVdata = function (rows) {
        // CSV 포맷으로 변경하여 리턴
        var data = '';
        rows = rows || table.rows;
        for (var i = 0, ilen = rows.length, row; row = rows[i], i < ilen; i++) {

            for (var k = 0, klen = row.length, cell; cell = row[k], k < klen; k++) {

                data += cell.indexOf(',') !== -1 ? '"' + cell + '"' : cell;

                if (k !== klen - 1) {

                    data += ','
                }
            }
            data += '\r\n';
        }
        return 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(data);
    };

    this.download = function (data, filename) {
        // 다운로드를 실행할 엘리먼트를 메모리에 생성하고 동작시킨다.
        var anchor = document.createElement('a');
        anchor.setAttribute('href', data);
        anchor.setAttribute('download', filename);
        anchor.click();
        // 지원여부
        return 'download' in anchor;
    }
}
