var TableExport = function (element, options) {

    if (!(this instanceof TableExport)) {
        // new 생성자를 사용하여 생성하도록 강제한다.
        throw "new 생성자를 이용해 주세요 :(";
    }

    // 이 함수는 호이스팅 됨
    function gather(element, options) {

        if (!(element instanceof HTMLTableElement)) {

            throw "인자 값으로 입력되는 엘리먼트는 테이블 엘리먼트이어야만 합니다 :("
        }

        var ret = {
            rows: [],
            metadata: [],
            boundary: {
                horizontal: 0,
                vertical: 0
            }
        };

        // `options`에 들어간 기본 값을 생성한다.
        options = !options ? {mergeCell: {}} : options;
        options.mergeCell.fill = options.mergeCell.fill === undefined ? true : options.mergeCell.fill;

        // 테이블 생성
        for (var i = 0, tr, trs = element.children, ilen = trs.length; tr = trs[i], i < ilen; i++) {
            // `tr`
            if (tr instanceof HTMLTableRowElement && tr.childElementCount > 0) {

                for (var k = 0, cSize = 0, cell, cells = tr.children, klen = cells.length; cell = cells[k], k < klen; k++) {

                    // `th`, `td`
                    if (cell instanceof HTMLTableCellElement) {

                        if (k === 0) {
                            // 테이블의 컬럼 갯수를 센다.
                            for (var j = 0, colspan; j < klen; j++) {

                                if (colspan = cell.colspan > 0) {
                                    cSize += colspan;
                                } else {
                                    cSize++
                                }
                            }
                        }

                        // 셀에 데이터가 존재하지 않는 경우 데이터를 입력한다. -- `colspan`, `rowspan`으로 인해 값이 미리 입력되는 경우를 제외한 모든 경우.
                        var ctext = cell.innerText;

                        if (!ret.rows[i]) {
                            // `Row`가 존재하지 않을경우 생성
                            ret.rows[i] = [];
                            ret.metadata[i] = [];
                        }

                        ret.rows[i].push(ctext);
                        // DOM 객체에 접근하지 않기 위해 미리 데이터를 생성함.
                        ret.metadata[i].push({
                            type: cell.nodeName,
                            colspan: cell.colSpan,
                            rowspan: cell.rowSpan
                        });

                        // 테이블 헤더의 경계선을 찾는다.
                        if (k === klen - 1 && cell.nodeName === 'TH') {
                            // 가로선의 경계를 찾는다
                            ret.boundary.horizontal++;
                        }

                        if (i === ilen - 1 && cell.nodeName === 'TH') {
                            // 세로선의 경계를 찾는다
                            ret.boundary.vertical += cell.colSpan > 1 ? cell.colSpan : 1;
                        }
                    }
                }
            }
        }

        // `colspan`, `rowspan` 데이터를 이용하여 빈 공간을 채움.
        for (var i = 0; i < ret.metadata.length; i++) {

            for (var k = 0; k < ret.metadata[i].length; k++) {

                var fill = options.mergeCell.fill === true ? ret.rows[i][k] : options.mergeCell.fill;
                var span = ret.metadata[i][k];

                if (span.colspan > 1) {
                    // `colspan` 개수만큼 셀에 데이터를 복사한다.
                    var rtail = ret.rows[i].splice(k + 1);
                    var mtail = ret.metadata[i].splice(k + 1);


                    for (var j = 1; j < span.colspan; j++) {

                        ret.rows[i].push(fill);
                        ret.metadata[i].push({type: ret.rows[i][k].nodeName, colspan: 0, rowspan: 0});
                    }

                    ret.rows[i].push.apply(ret.rows[i], rtail);
                    ret.metadata[i].push.apply(ret.metadata[i], mtail);
                }

                if (span.rowspan > 1) {
                    // `rowspan` 개수만큼 셀에 데이터를 복사한다.
                    for (var j = 1; j < span.rowspan; j++) {

                        rtail = ret.rows[i + j].splice(k);
                        mtail = ret.metadata[i + j].splice(k);

                        ret.rows[i + j].push(fill);
                        ret.metadata[i + j].push({type: ret.rows[i][k].nodeName, colspan: 0, rowspan: 0});

                        ret.rows[i + j].push.apply(ret.rows[i + j], rtail);
                        ret.metadata[i + j].push.apply(ret.metadata[i + j], mtail);
                    }
                }
            }
        }
        return ret;
    }

    // 테이블에 정보를 담는다.
    var table = gather(element, options);

    this.update = function (element, options) {
        // 테이블 정보를 갱신한다.
        table = gather(element, options);
        return this;
    };

    this.toArray = function () {
        // 데이터를 배열로 리턴한다.
        return table.rows.slice();
    };

    this.toCSVdata = function (rows, csvOptions) {
        // 기본 값
        csvOptions = csvOptions || {};
        // CSV 포맷으로 변경하여 리턴
        var data = '';
        // `rows` 데이터를 복사한다.
        rows = (rows || table.rows).slice();
        for (var i = 0, ilen = rows.length, row; row = rows[i], i < ilen; i++) {

            for (var k = 0, klen = row.length, cell; cell = row[k], k < klen; k++) {

                data += cell.indexOf(',') !== -1 ? '"' + cell + '"' : cell;

                if (k !== klen - 1) {

                    data += ','
                }
            }
            data += '\r\n';
        }
        console.log(data);
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
};
