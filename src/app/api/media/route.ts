import CustomError from "@/classes/CustomError";
import { fetchData } from "@/lib/functions";
import { postMedia } from "@/models/mediaModel";
import { UploadResponse } from "hybrid-types";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authActions";

export async function POST(request: NextRequest) {
  try {
    // TODO: get the form data from the request
    const formData = await request.formData();
    // TODO: get the token from the cookie
    const token = request.cookies.get("session")?.value;
    console.log(token);
    if (!token) {
      throw new CustomError("Unauthorized", 401);
    }
    // TODO: send the form data to the uppload server. See apiHooks from previous classes.
    const options = {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer " + token,
      },
    };

    const uploadResult = await fetchData<UploadResponse>(
      `${process.env.UPLOAD_SERVER}/upload`,
      options
    );
    // TODO: if the upload response is not valid, return an error response with NextResponse
    if (!uploadResult) {
      return new NextResponse("Error uploading media", { status: 500 });
    }
    // TODO: get title and description from the form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    // TODO: get the filename, filesize and media_type  from the upload response
    const { filename, filesize, media_type } = uploadResult.data;
    // TODO: get user_id from getSession() function
    const tokenContent = await getSession();
    if (!tokenContent) {
      throw new NextResponse("Unauthorized", { status: 401 });
    }
    // TODO: create a media item object, see what postMedia funcion in mediaModel wants for input.
    const mediaItem = {
      title,
      description,
      filename: filename,
      filesize: filesize,
      media_type: media_type,
      user_id: tokenContent.user_id,
    };
    // TODO: use the postMedia function from the mediaModel to add the media to the database. Since we are putting data to the database in the same app, we dont need to use a token.
    const postResult = await postMedia(mediaItem);

    if (!postResult) {
      return new NextResponse("Error adding media to database", {
        status: 500,
      });
    }

    const uploadResponse: UploadResponse = {
      message: "Media added to database",
      data: postResult,
    };

    return new NextResponse(JSON.stringify(uploadResponse), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error((error as Error).message, error);
    return new NextResponse((error as Error).message, { status: 500 });
  }
}
