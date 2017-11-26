// 如需空白範本的簡介，請參閱下列文件: 
// http://go.microsoft.com/fwlink/?LinkID=397704
// 若要針對在 Ripple 或 Android 裝置/模擬器上載入的頁面，偵錯程式碼: 請啟動您的應用程式，設定中斷點，
// 然後在 JavaScript 主控台中執行 "window.location.reload()"。
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    var g_dtcWebApi = "http://dtclocalleader.azurewebsites.net/api/";

    var g_token;

    var g_storageUser = window.localStorage;

    function onDeviceReady() {
        // 處理 Cordova 暫停與繼續事件
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);

        //設定
        $("#lnkSetting").on("click", fnSettingLoad);

        $("#btnMember").on("click", fnGetMember);

        $("#lnkActiveList").on("click", fnActiveList);

        $("#lnkActivePhotoList").on("click", fnActivePhoneList);


        $("#btnPhotoUpload").on("click", fnPhotoUpload);

        TestPush();
        

    };
    function TestPush() {
        //FCMPlugin.onTokenRefresh( onTokenRefreshCallback(token) );
        //Note that this callback will be fired everytime a new token is generated, including the first time.
        FCMPlugin.onTokenRefresh(function (token) {
            //alert(token);
        });
        //FCMPlugin.getToken( successCallback(token), errorCallback(err) );
        //Keep in mind the function will return null if the token has not been established yet.
        FCMPlugin.getToken(function (token) {
            //alert(token);
        });
        //FCMPlugin.subscribeToTopic( topic, successCallback(msg), errorCallback(err) );
        //All devices are subscribed automatically to 'all' and 'ios' or 'android' topic respectively.
        //Must match the following regular expression: "[a-zA-Z0-9-_.~%]{1,900}".
        FCMPlugin.subscribeToTopic('all');

        //FCMPlugin.onNotification( onNotificationCallback(data), successCallback(msg), errorCallback(err) )
        //Here you define your application behaviour based on the notification data.
        FCMPlugin.onNotification(function (data) {
            if (data.wasTapped) {
                //Notification was received on device tray and tapped by the user.
                //alert(JSON.stringify(data));
                navigator.notification.alert(
                    data.msg,           //訊息
                    null,      //回傳處理函數
                    data.title,          //標題
                    "確定"               //按鈕文
                    );
            } else {
                //Notification was received in foreground. Maybe the user needs to be notified.
                //alert(JSON.stringify(data));
                navigator.notification.alert(
                    data.msg,           //訊息
                    null,      //回傳處理函數
                    data.title,          //標題
                    "確定"               //按鈕文
                 );
            }
        });
    }

    
    //****************************************************拍照,開始****************************************************






    //確定照像
    function fnPhotoUpload() {

            //照像
            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 80,
                destinationType: Camera.DestinationType.FILE_URI,  //使用檔案
                sourceType: Camera.PictureSourceType.CAMERA,  //使用相機照相
                encodingType: Camera.EncodingType.JPEG,  //存為JPG檔
                correctOrientation: true,  //可旋轉圖片
                saveToPhotoAlbum: true  //存到媒體庫
            });

    }

    var g_filename;
    var g_photo;
    var g_targetPath;

    //照像成功
    function onSuccess(imageURI) {  //照相或選取圖片成功
        var activename = g_storageUser.getItem("activename")

        g_targetPath = imageURI;
        g_filename =  g_targetPath.split('/').pop();
        g_photo = true;
        uploadPhoto();
        navigator.notification.confirm(
            "照片己傳送" + activename,
            null,
            "活動照片",
            ["確定"]
        );
    }
    //拍照失敗
    function onFail(message) {  //錯誤處理
        alert('錯誤：' + message);
    }


    //上傳圖片
    function uploadPhoto() {
        var options = {
            fileKey: "file",
            fileName: g_filename,
            chunkedMode: false,
            mimeType: "image/jpg",
            params: { 'fileName': g_filename }
        };


        var uploadApi = "http://dtclocalleader.azurewebsites.net/PhotoUpload/Index";

        var ft = new FileTransfer();
        
        ft.upload(g_targetPath, uploadApi,
            function () {
            },
            function () {
                alert('上傳失敗');
            },
            options
        );


        //var uid = g_storageUser.getItem("uid");
        //var str = uid + "|" + g_filename + "|" + g_dsid;
        g_photo = false;

        var name, activename;
        activename = g_storageUser.getItem("activename")
        name = g_storageUser.getItem("name");


        $.getJSON(g_dtcWebApi + "UploadPhotoData?photo=" + encodeURI(g_filename) + "&name=" + encodeURI(name) + "&activename=" + encodeURI(activename),
            function (data) {
                $.mobile.changePage("#pageIndex", { transition: "slidedown" });
            });
    }

    //****************************************************拍照,結束****************************************************

    //****************************************************活動照片, 開始***************************************************
    function fnActivePhoneList() {
        $.mobile.changePage("#pageActivePhotoList", { transition: "slidedown" });

        var activeplace = g_storageUser.getItem("area");

        

        $.getJSON(g_dtcWebApi + "Active?area=" + encodeURI(activeplace),
            function (data) {
                //$("#floatingBarsG").show();
                $("#listPhoto").empty();
                if (data.length == 0) {
                    navigator.notification.alert(
                        "目前無活動訊息",           //訊息
                        null,      //回傳處理函數
                        "活動訊息",          //標題
                        "確定"               //按鈕文
                    );
                    return;
                }

                for (var i = 0; i < data.length; i++) {
                    $("#listPhoto").append
                        (
                        '<li>' +
                            '<a href="#" id="photo' + i + '">' +
                                '<h1>活動名稱：' + data[i].活動名稱 + '</h1>' +
                                '<p>' + data[i].活動起始時間 + '~' + data[i].活動結束時間 + '</p>' +
                            '</a>' +
                        '</li>'
                    );
                    $("#photo" + i).on("click",
                        {
                            fId: data[i].fId,
                            活動名稱: data[i].活動名稱,
                            活動起始時間: data[i].活動起始時間,
                            活動結束時間: data[i].活動結束時間
                        }, fnActivePhotoDetails);
                }
                $("#listPhoto").listview("refresh");
                //$("#floatingBarsG").hide();
            });
    }


    function fnActivePhotoDetails(event) {

        $.mobile.changePage("#pageActivePhotoDetails", { transition: "slidedown" });
        var activename = event.data.活動名稱

        g_storageUser.setItem("activename", activename);

        $.getJSON(g_dtcWebApi + "ActivePhotoDetails?activename=" + encodeURI(activename),
            function (data) {
                //$("#floatingBarsG").show();
                $("#listPhotoDetails").empty();
                if (data.length == 0) {
                    navigator.notification.alert(
                        "目前無活動照片",           //訊息
                        null,      //回傳處理函數
                        "活動照片",          //標題
                        "確定"               //按鈕文
                    );
                    return;
                }

                for (var i = 0; i < data.length; i++) {
                    $("#listPhotoDetails").append
                        ("<img src='http://dtclocalleader.azurewebsites.net/images/"+data[i].照片+"' style='width:80%;'><br>"+data[i].說明 +"<hr>" );
                }
                $("#listPhotoDetails").listview("refresh");
                //$("#floatingBarsG").hide();
            });
    }
    
    //****************************************************活動照片, 結束***************************************************

    //****************************************************活動清單, 開始***************************************************
    function fnActiveList() {

        $.mobile.changePage("#pageActiveList", { transition: "slidedown" });

        var activeplace =  g_storageUser.getItem("area");


        $.getJSON(g_dtcWebApi + "Active?area=" + encodeURI(activeplace),
            function (data) {
                $("#floatingBarsG").show();
                $("#listActive").empty();
                if (data.length == 0) {
                    navigator.notification.alert(
                        "目前無活動訊息",           //訊息
                        null,      //回傳處理函數
                        "活動訊息",          //標題
                        "確定"               //按鈕文
                    );
                    return;
                }

                for (var i = 0; i < data.length; i++) {
                    $("#listActive").append
                        (
                        '<li>' +
                            '<a href="#" id="active' + i + '">' +
                                '<h1>活動名稱：' + data[i].活動名稱 + '</h1>' +
                                '<p>' + data[i].活動起始時間 + '~' + data[i].活動結束時間 + '</p>' +
                            '</a>' +
                        '</li>'
                    );
                    $("#active" + i).on("click",
                        {
                            fId: data[i].fId,
                            活動名稱: data[i].活動名稱,
                            活動起始時間: data[i].活動起始時間,
                            活動結束時間: data[i].活動結束時間
                        }, fnActiveDetails);
                }
                $("#listActive").listview("refresh");
                $("#floatingBarsG").hide();
            });
    }



    function fnActiveDetails(event) {
        $.mobile.changePage("#pageActiveDetails", { transition: "slidedown" });
        var activename = event.data.活動名稱
        $.getJSON(g_dtcWebApi + "ActiveDetails?activename=" + encodeURI(activename),
            function (data) {
                $("#活動名稱").html("活動名稱：" + data.活動名稱);
                $("#活動內容").html("活動內容：" + data.活動內容);
                $("#活動地點").html("活動地點：" + data.活動地點);
                $("#活動起始時間").html("活動起始時間：" + data.活動起始時間 );
                $("#活動結束時間").html("活動結束時間：" + data.活動結束時間);

                var htmlstr = "<center><img src='http://dtclocalleader.azurewebsites.net/images/" + data.圖片 + "' style='width:90%;'></center>";

                $("#圖片").html(htmlstr);


                var activename, uid;
                activename = data.活動名稱;
                uid = g_storageUser.getItem("uid");

                //$("#divFooter").hide();
                $("#btnSignUp").on("click", { activename: activename, uid: uid }, fnSignUp);
                //$("#btnTakeMedicine").unbind("click", fnTakeMedicine);
                //if (data.f抵達時間 == "") {
                //    $("#divFooter").show();
                //    $("#btnTakeMedicine").on("click", { fId: data.fId }, fnTakeMedicine);
                //}
            }
        );
    }

    function fnSignUp(event) {
        var activename = event.data.activename ;
        var uid = event.data.uid;
        $.getJSON(g_dtcWebApi + "ActiveSignUpOK?activename=" + encodeURI(activename) + "&uid=" + encodeURI(uid),
            function (data) {
                navigator.notification.alert(
                    activename + "報名成功",           //訊息
                    null,      //回傳處理函數
                    "活動報名",          //標題
                    "確定"               //按鈕文
                );
            }
        );
        
    }



    //****************************************************活動清單, 結束***************************************************

    //****************************************************掃描註冊, 結束***************************************************
    function setPatientData(uid, name, phone, birthday) {
        g_storageUser.setItem("uid", uid);
        g_storageUser.setItem("name", name);
        g_storageUser.setItem("phone", phone);
        g_storageUser.setItem("birthday", birthday);
        g_storageUser.setItem("token", g_token);
    }

    function fnSettingLoad() {
        $.mobile.changePage("#pageSetting", { transition: "slidedown" });

        var uid, name, phone, area, dsId, reuid;
        uid = g_storageUser.getItem("uid");
        name = g_storageUser.getItem("name");
        phone = g_storageUser.getItem("phone");
        area = g_storageUser.getItem("area");
        //g_token = g_storageUser.getItem("token");

        $('#txtUid').val(uid);
        $('#txtName').val(name);
        $('#txtPhone').val(phone);
        $('#txtArea').val(area);
        //$('#txtToken').val(g_token);
    }

    function fnGetMember() {
        $.mobile.changePage("#pageSetting", { transition: "slidedown" });
        var id=$('#txtUid').val();
        $.getJSON(g_dtcWebApi + "Member?id=" + encodeURI(id),
            function (data) {
                $('#txtUid').val(data.帳號);
                $('#txtName').val(data.名稱);
                $('#txtPhone').val(data.電話);
                $('#txtArea').val(data.區域);
                g_storageUser.setItem("uid", data.帳號);
                g_storageUser.setItem("name", data.名稱);
                g_storageUser.setItem("phone", data.電話);
                g_storageUser.setItem("area", data.區域);
                return;
            }
        );
    }


    function onPause() {
        // TODO: 這個應用程式已暫停。請在這裡儲存應用程式狀態。
    };

    function onResume() {
        // TODO: 這個應用程式已重新啟動。請在這裡還原應用程式狀態。
    };
} )();